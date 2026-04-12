const scriptURL = 'https://script.google.com/macros/s/AKfycbxv6v9m99yLAiB1Q0mmI_qO-NU0VGEoHxDLbK0pB9sxjL_jVSMa48evq8ulNbu8tbjRYg/exec';
const languageSelect = document.getElementById('languageSelect');
const totalPriceDisplay = document.getElementById('totalPriceDisplay');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = errorMessage.querySelector('p');

// State
let bookingState = {
    date: '',
    startTime: '',
    duration: 1,
    people: 1,
    isAllDay: false
};

// Translations
const translations = {
    zh: {
        nav_home: "首页",
        nav_pricing: "价位表",
        nav_booking: "预约体验",
        nav_social: "社交媒体",
        hero_title: "✦ DIY 拼豆创意工作室 ✦",
        hero_desc: "在这里，你可以亲手制作属于你的像素艺术。我们提供所有工具，无需任何经验！",
        cta_booking: "预约体验 ✨🧸",
        cta_pricing: "查看价位 🍭",
        feat1_title: "专业烫印",
        feat1_desc: "店内使用全自动烫画机，默认单面无孔，也提供特殊烫。工作人员会帮你完成最后的烫印步骤，确保作品完美。",
        feat2_title: "免费工具",
        feat2_desc: "店内工具有大小豆板，单双针豆笔，豆铲，立豆盘，尖头弯头镊子等，按需取用。",
        feat3_title: "自定成品",
        feat3_desc: "成品可做钥匙扣，冰箱贴，手机链，风铃，Crocs鞋扣等。",
        feat4_title: "分享特惠",
        feat4_desc: "在任何社交媒体上分享，下次来即可享受8折优惠。",
        studio_location: "手工拼豆制作体验 · 创意像素艺术",
        pricing_title: "价位表 🌈",
        hourly_pricing: "🧸 按时计费",
        daypass_pricing: "🍓 全天通票",
        th_people: "人数",
        th_price: "价格",
        td_solo_label: "单人",
        td_duo_label: "双人",
        th_date: "日期",
        td_wed_thu: "周三 - 周四",
        td_fri_sun: "周五 - 周日",
        booking_title: "预约体验 ✨🎀",
        label_date_select: "选择日期",
        label_time_select: "到店时间",
        label_duration_select: "预期消费时长",
        label_people_select: "预约人数",
        unit_min: "分钟",
        unit_person: "人",
        opt_daypass: "全天通票",
        up_from: "起",
        total_amount: "合计金额",
        btn_confirm: "确认预约",
        btn_submitting: "提交中...",
        btn_checking: "正在检查名额...",
        placeholder_name: "您的姓名",
        placeholder_phone: "您的电话",
        placeholder_email: "你的邮箱",
        placeholder_notes: "特别说明 (例如：微信 ID、特殊需求等)",
        success_title: "✓ 预约已提交！",
        success_desc: "我们已收到您的预约请求，系统将自动同步至工作室日历。请检查您的邮箱获取确认通知。",
        error_title: "⚠️ 提交失败",
        error_desc: "抱歉，预约提交时出现问题。请稍后再试或通过社交媒体联系我们。",
        social_xhs: "小红书",
        social_wechat: "微信公众号",
        wechat_scan_tip: "扫一扫，关注我们的微信公众号",
        footer_name: "Beads Land",
        today: "今天",
        tomorrow: "明天",
        mon: "周一", tue: "周二", wed: "周三", thu: "周四", fri: "周五", sat: "周六", sun: "周日"
    },
    en: {
        nav_home: "Home",
        nav_pricing: "Pricing",
        nav_booking: "Booking",
        nav_social: "Social",
        hero_title: "✦ DIY Perler Bead Studio ✦",
        hero_desc: "Create adorable pixel art at Beads Land. We provide all the tools, no experience needed!",
        cta_booking: "Book Now ✨🧸",
        cta_pricing: "View Pricing 💰",
        feat1_title: "Professional Ironing",
        feat1_desc: "We use fully automatic heat presses. Default is single-sided no-hole, special ironing also available. Staff will assist with final steps.",
        feat2_title: "Free Tools",
        feat2_desc: "Various boards, single/double needle bead pens, scrapers, plates, and tweezers available for use.",
        feat3_title: "Custom Products",
        feat3_desc: "Can be made into keychains, fridge magnets, phone straps, wind chimes, Crocs jibbitz, etc.",
        feat4_title: "Sharing Offer",
        feat4_desc: "Share on any social media and get 20% off your next visit.",
        pricing_title: "Pricing 🌈",
        hourly_pricing: "🧸 Hourly Rate",
        daypass_pricing: "🍓 Day Pass",
        th_people: "People",
        th_price: "Price",
        td_solo_label: "Solo",
        td_duo_label: "Duo",
        th_date: "Date",
        td_wed_thu: "Wed - Thu",
        td_fri_sun: "Fri - Sun",
        booking_title: "Book a Session ✨🎀",
        label_date_select: "Select Date",
        label_time_select: "Arrival Time",
        label_duration_select: "Expected Duration",
        label_people_select: "Number of People",
        unit_min: "min",
        unit_person: "people",
        opt_daypass: "All-Day Pass",
        up_from: "up",
        total_amount: "Total",
        btn_confirm: "Confirm",
        btn_submitting: "Submitting...",
        btn_checking: "Checking slots...",
        placeholder_name: "Your Name",
        placeholder_phone: "Your Phone",
        placeholder_email: "Email for confirmation",
        placeholder_notes: "Special notes (e.g., WeChat ID, requests)",
        success_title: "✓ Booking Submitted!",
        success_desc: "We've received your request and synced it to our calendar. Check your email for confirmation.",
        error_title: "⚠️ Submission Failed",
        error_desc: "Sorry, there was a problem. Please try again later.",
        social_xhs: "RED",
        social_wechat: "WeChat",
        wechat_scan_tip: "Scan to follow our WeChat Account",
        studio_location: "DIY Perler Bead Experience · Creative Pixel Art",
        footer_name: "Beads Land",
        today: "Today",
        tomorrow: "Tom",
        mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun"
    }
};

// 1. Language Update
function updateLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    localStorage.setItem('preferred_lang', lang);
    renderDates(); // Re-render dates for "Today/Tomorrow" labels
}

languageSelect.addEventListener('change', (e) => updateLanguage(e.target.value));
const savedLang = localStorage.getItem('preferred_lang') || 'zh';
languageSelect.value = savedLang;
updateLanguage(savedLang);

// 2. Date Generator
function renderDates() {
    const lang = languageSelect.value;
    const dateList = document.getElementById('dateList');
    dateList.innerHTML = '';
    
    const today = new Date();
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const validDays = [3, 4, 5, 6, 0]; // Wed, Thu, Fri, Sat, Sun

    let count = 0;
    let i = 0;
    while (count < 7) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const dayOfWeek = d.getDay();

        if (validDays.includes(dayOfWeek)) {
            const dateStr = d.toISOString().split('T')[0];
            const dateNum = d.getDate();
            let dayName = translations[lang][dayNames[dayOfWeek]];
            
            // Basic label check for Today/Tomorrow
            const diffDays = Math.floor((d.getTime() - new Date(today.toISOString().split('T')[0]).getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) dayName = translations[lang].today;
            if (diffDays === 1) dayName = translations[lang].tomorrow;

            const card = document.createElement('div');
            card.className = `date-card ${bookingState.date === dateStr ? 'active' : ''}`;
            
            // Default selection
            if (!bookingState.date && count === 0) {
                card.className = 'date-card active';
                bookingState.date = dateStr;
                fetchAvailability(dateStr);
            }

            card.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="date-num">${dateNum}</div>
            `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.date-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                bookingState.date = dateStr;
                fetchAvailability(dateStr);
            });
            dateList.appendChild(card);
            count++;
        }
        i++;
        if (i > 30) break; // Safety break
    }
}

// 3. Time Grid Generator
function renderTimeGrid(occupancy = {}, limit = 18) {
    const timeGrid = document.getElementById('timeGrid');
    timeGrid.innerHTML = '';
    
    if (!bookingState.date) return;
    
    const d = new Date(bookingState.date);
    const dayOfWeek = d.getDay();
    
    let startHour = 12;
    let endHour = 19; // Default Wed/Thu
    
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) { // Fri/Sat/Sun
        endHour = 21;
    }

    for (let h = startHour; h <= endHour; h++) {
        const time = `${h}:00`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `grid-btn ${bookingState.startTime === time ? 'active' : ''}`;
        btn.innerText = time;
        
        // Disable if full (18 people limit)
        const currentCount = occupancy[time] || 0;
        if (currentCount >= limit) {
            btn.disabled = true;
        }

        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-grid .grid-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bookingState.startTime = time;
        });
        timeGrid.appendChild(btn);
    }
}

// 4. Availability Fetcher
function fetchAvailability(date) {
    if (scriptURL.includes('YOUR_GOOGLE')) return renderTimeGrid();
    
    // Simple loader
    const timeGrid = document.getElementById('timeGrid');
    timeGrid.innerHTML = '<div style="grid-column: span 4; font-size: 12px; color: #888;">Checking...</div>';

    fetch(`${scriptURL}?date=${date}`)
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            renderTimeGrid(res.occupancy, res.limit || 18);
        } else {
            renderTimeGrid();
        }
    })
    .catch(() => renderTimeGrid());
}

// 5. Price Calculator
function calculatePrice() {
    // Price display removed from UI
    bookingState.totalPrice = 0;
}

// 6. Grid Selectors Events
document.querySelectorAll('.duration-grid .grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.duration-grid .grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const val = btn.getAttribute('data-value');
        if (val === 'all-day') {
            bookingState.isAllDay = true;
            bookingState.duration = 10; // Use a high dummy value for all-day
        } else {
            bookingState.isAllDay = false;
            bookingState.duration = parseFloat(val);
        }
    });
});

document.querySelectorAll('.people-grid .grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.people-grid .grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bookingState.people = parseInt(btn.getAttribute('data-value'));
    });
});

// 7. Submission
confirmBookingBtn.addEventListener('click', () => {
    const lang = languageSelect.value;
    
    // Validate
    if (!bookingState.startTime) {
        alert(lang === 'zh' ? '请选择到店时间' : 'Please select arrival time');
        return;
    }
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const notes = document.getElementById('notes').value;

    if (!name || !phone || !email) {
        alert(lang === 'zh' ? '请填写必填个人信息' : 'Please fill in required info');
        return;
    }

    if (scriptURL.includes('YOUR_GOOGLE')) {
        alert(lang === 'zh' ? '请先配置 Google Apps Script URL！' : 'Please configure GAS URL!');
        return;
    }

    // Submit
    confirmBookingBtn.disabled = true;
    confirmBookingBtn.innerText = translations[lang].btn_submitting;
    errorMessage.classList.add('hidden');

    const payload = {
        ...bookingState,
        name, phone, email, notes,
        service: bookingState.isAllDay ? 'Day Pass' : 'Session'
    };

    fetch(scriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            document.querySelector('.booking-app').classList.add('hidden');
            successMessage.classList.remove('hidden');
        } else {
            throw new Error(res.message);
        }
    })
    .catch(err => {
        confirmBookingBtn.disabled = false;
        confirmBookingBtn.innerText = translations[lang].btn_confirm;
        errorText.innerText = err.message || translations[lang].error_desc;
        errorMessage.classList.remove('hidden');
    });
});

// 8. Init
renderDates();
calculatePrice();

// WeChat Modal
const wechatLink = document.getElementById('wechatLink');
const wechatModal = document.getElementById('wechatModal');
const closeModal = document.querySelector('.close-modal');
if (wechatLink) wechatLink.addEventListener('click', () => wechatModal.classList.remove('hidden'));
if (closeModal) closeModal.addEventListener('click', () => wechatModal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === wechatModal) wechatModal.classList.add('hidden'); });

// 9. Horizontal Scroll Drag Support (for Desktop)
const slider = document.querySelector('.date-scroll-wrapper');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active-drag');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active-drag');
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active-drag');
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
}
