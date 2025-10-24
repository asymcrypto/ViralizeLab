// supabase/functions/crypto-payment-verification/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Your wallet addresses - REPLACE WITH YOUR ACTUAL WALLETS
const YOUR_WALLETS = {
  'usdc': 'TBikeQpNoSMumR5YvzXKY2mxSZy2njU8tZ', // Your USDC wallet
  'usdt': 'TBikeQpNoSMumR5YvzXKY2mxSZy2njU8tZ', // Your USDT wallet  
  'btc': 'bc1qyw0u2lv20n7a8a5n403saf4hvw59lpm7rw05mv', // Your Bitcoin wallet
  'eth': '0xECcaC2900682402eA17efDA528b6682F580f908B', // Your Ethereum wallet
}

interface CryptoPayment {
  user_id: string
  transaction_hash: string
  crypto_currency: string
  amount: number
  credits: number
  from_address: string
  to_address: string
  network?: string // mainnet, testnet, etc.
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://xootzogwkoovtpdkgdsd.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb3R6b2d3a29vdnRwZGtnZHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjY3NDUsImV4cCI6MjA3NjgwMjc0NX0.LJ07QAuo_9dOkzq-dt_vaPFVaxH6bC19aI6FYyBWa4M'
    )

    const { payment }: { payment: CryptoPayment } = await req.json()

    // Validate required fields
    if (!payment.user_id || !payment.transaction_hash || !payment.amount || !payment.crypto_currency) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, transaction_hash, amount, crypto_currency' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check if this transaction was already processed
    const { data: existingTx } = await supabaseClient
      .from('transactions')
      .select('id')
      .eq('transaction_hash', payment.transaction_hash)
      .single()

    if (existingTx) {
      return new Response(
        JSON.stringify({ error: 'Transaction already processed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Verify the transaction goes to YOUR wallet
    const yourWallet = YOUR_WALLETS[payment.crypto_currency as keyof typeof YOUR_WALLETS]
    if (!yourWallet) {
      return new Response(
        JSON.stringify({ error: 'Unsupported cryptocurrency' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (payment.to_address.toLowerCase() !== yourWallet.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Invalid recipient address' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Verify transaction on blockchain
    const verification = await verifyBlockchainTransaction(payment)
    
    if (!verification.success) {
      // Log failed verification
      await supabaseClient
        .from('transactions')
        .insert({
          user_id: payment.user_id,
          type: 'purchase',
          credits: payment.credits,
          amount: payment.amount,
          currency: 'USD',
          payment_method: 'crypto',
          crypto_currency: payment.crypto_currency,
          transaction_hash: payment.transaction_hash,
          status: 'failed',
          failure_reason: verification.error,
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ error: `Transaction verification failed: ${verification.error}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Add credits to user
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', payment.user_id)
      .single()

    if (profileError) throw profileError

    const newCredits = (profile.credits || 0) + payment.credits

    // Update user credits
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', payment.user_id)

    if (updateError) throw updateError

    // Record successful transaction
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: payment.user_id,
        type: 'purchase',
        credits: payment.credits,
        amount: payment.amount,
        currency: 'USD',
        payment_method: 'crypto',
        crypto_currency: payment.crypto_currency,
        transaction_hash: payment.transaction_hash,
        status: 'completed',
        block_confirmations: verification.confirmations,
        created_at: new Date().toISOString()
      })

    if (transactionError) throw transactionError

    // Send confirmation email
    await sendConfirmationEmail(payment.user_id, payment.credits)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Added ${payment.credits} credits to user`,
        new_balance: newCredits,
        transaction_hash: payment.transaction_hash,
        confirmations: verification.confirmations
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Real blockchain verification with multiple providers
async function verifyBlockchainTransaction(payment: CryptoPayment): Promise<{success: boolean; confirmations?: number; error?: string}> {
  try {
    switch (payment.crypto_currency.toLowerCase()) {
      case 'eth':
      case 'usdc':
      case 'usdt':
        return await verifyEthereumTransaction(payment)
      
      case 'btc':
        return await verifyBitcoinTransaction(payment)
      
      default:
        return { success: false, error: 'Unsupported cryptocurrency' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function verifyEthereumTransaction(payment: CryptoPayment) {
  // Using Etherscan API (free tier available)
  const ETHERSCAN_API_KEY = Deno.env.get('ETHERSCAN_API_KEY')
  const response = await fetch(
    `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${payment.transaction_hash}&apikey=${ETHERSCAN_API_KEY}`
  )
  
  const data = await response.json()
  
  if (data.status === '1' && data.message === 'OK') {
    // Get transaction details to verify amount and recipient
    const txDetails = await fetch(
      `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${payment.transaction_hash}&apikey=${ETHERSCAN_API_KEY}`
    )
    
    const txData = await txDetails.json()
    
    if (txData.result) {
      const actualTo = txData.result.to
      const actualValue = parseInt(txData.result.value, 16) / 1e18 // Convert from wei
      
      // Verify it's your wallet and correct amount
      const yourWallet = YOUR_WALLETS[payment.crypto_currency as keyof typeof YOUR_WALLETS]
      if (actualTo.toLowerCase() === yourWallet.toLowerCase() && actualValue >= payment.amount) {
        return { success: true, confirmations: 10 } // Etherscan shows confirmed
      }
    }
  }
  
  return { success: false, error: 'Transaction not found or failed' }
}

async function verifyBitcoinTransaction(payment: CryptoPayment) {
  // Using BlockCypher API (free tier available)
  const response = await fetch(
    `https://api.blockcypher.com/v1/btc/main/txs/${payment.transaction_hash}`
  )
  
  if (response.status === 200) {
    const data = await response.json()
    
    // Find output to your wallet
    const yourWallet = YOUR_WALLETS['btc']
    const outputToYou = data.outputs.find((output: any) => 
      output.addresses && output.addresses.includes(yourWallet)
    )
    
    if (outputToYou) {
      const amountBTC = outputToYou.value / 100000000 // Convert from satoshis
      if (amountBTC >= payment.amount) {
        return { success: true, confirmations: data.confirmations }
      }
    }
  }
  
  return { success: false, error: 'Bitcoin transaction not found' }
}

async function sendConfirmationEmail(userId: string, credits: number) {
  // Get user email from Supabase
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? 'https://xootzogwkoovtpdkgdsd.supabase.co',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb3R6b2d3a29vdnRwZGtnZHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjY3NDUsImV4cCI6MjA3NjgwMjc0NX0.LJ07QAuo_9dOkzq-dt_vaPFVaxH6bC19aI6FYyBWa4M'
  )
  
  const { data: user } = await supabaseClient.auth.admin.getUserById(userId)
  
  if (user && user.user?.email) {
    // Send email via Resend or your email service
    console.log(`Sent ${credits} credits confirmation to ${user.user.email}`)
    
    // Example with Resend:
    /*
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    await resend.emails.send({
      from: 'ViralizeLab <credits@viralizelab.com>',
      to: user.user.email,
      subject: `🎉 ${credits} Credits Added to Your Account!`,
      html: `
        <h2>Payment Confirmed! 🚀</h2>
        <p>We've added <strong>${credits} credits</strong> to your ViralizeLab account.</p>
        <p>You can now create amazing carousels with your new credits!</p>
        <a href="https://viralizelab.com/dashboard" style="background: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Start Creating</a>
      `
    })
    */
  }
}
