document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simulate form submission
    const formData = {
        service: document.getElementById('service').value,
        people: document.getElementById('people').value,
        date: document.getElementById('date').value,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        wechat: document.getElementById('wechat').value,
        notes: document.getElementById('notes').value
    };

    console.log('Booking submitted:', formData);

    // Show success message
    document.getElementById('bookingForm').classList.add('hidden');
    document.getElementById('successMessage').classList.remove('hidden');

    // In a real application, you would send this to a server
    // For example, via fetch() to a backend API
});

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').setAttribute('min', today);
