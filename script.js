function joinWaitlist() {
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email').value || document.getElementById('email2').value;
    
    if (!email) {
        alert('Please enter your email!');
        return;
    }

    // Simple email collection (we'll enhance this later)
    const waitlistData = {
        name: name,
        email: email,
        timestamp: new Date().toISOString()
    };

    // For now, just show success message
    alert(`🎉 Thanks ${name || 'there'}! You're on the waitlist. We'll email you at ${email} when we launch!`);
    
    // Clear form
    document.getElementById('name') && (document.getElementById('name').value = '');
    document.getElementById('email').value = '';
    document.getElementById('email2') && (document.getElementById('email2').value = '');
    
    // In future: Send to Google Sheets/Airtable/email service
    console.log('Waitlist signup:', waitlistData);
}
