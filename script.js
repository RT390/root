// متغيرات التطبيق
let currentScreen = 'welcome';
let messageData = {
    senderName: '',
    message: ''
};

// عناصر DOM
const screens = {
    welcome: document.getElementById('welcome-screen'),
    message: document.getElementById('message-screen'),
    link: document.getElementById('link-screen'),
    view: document.getElementById('view-message-screen')
};

// الأزرار وعناصر التحكم
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');
const backToMessageBtn = document.getElementById('back-to-message-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');
const newMessageBtn = document.getElementById('new-message-btn');
const shareAgainBtn = document.getElementById('share-again-btn');
const createYourOwnBtn = document.getElementById('create-your-own-btn');

// عناصر النموذج
const senderNameInput = document.getElementById('sender-name');
const messageTextInput = document.getElementById('message-text');
const charCount = document.getElementById('char-count');
const generatedLink = document.getElementById('generated-link');
const previewText = document.getElementById('preview-text');
const previewSender = document.getElementById('preview-sender');
const viewMessageText = document.getElementById('view-message-text');
const viewSenderName = document.getElementById('view-sender-name');
const currentYear = document.getElementById('current-year');

// الإشعارات
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
    checkForSharedMessage();
});

// تهيئة التطبيق
function initApp() {
    // تعيين السنة الهجرية الحالية (تقريبية)
    const hijriYear = Math.floor((new Date().getFullYear() - 622) * 33 / 32);
    currentYear.textContent = hijriYear;
    
    // تهيئة شاشة الترحيب
    showScreen('welcome');
    
    // تعيين الحد الأقصى للأحرف
    messageTextInput.maxLength = 500;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار التنقل بين الشاشات
    startBtn.addEventListener('click', () => showScreen('message'));
    backBtn.addEventListener('click', () => showScreen('welcome'));
    backToMessageBtn.addEventListener('click', () => showScreen('message'));
    backToHomeBtn.addEventListener('click', () => showScreen('welcome'));
    newMessageBtn.addEventListener('click', () => {
        resetForm();
        showScreen('message');
    });
    
    // نموذج الرسالة
    messageTextInput.addEventListener('input', updateCharCount);
    senderNameInput.addEventListener('input', validateForm);
    messageTextInput.addEventListener('input', validateForm);
    
    // إنشاء الرابط
    generateBtn.addEventListener('click', generateLink);
    
    // نسخ الرابط
    copyBtn.addEventListener('click', copyLink);
    
    // مشاركة عبر واتساب
    whatsappBtn.addEventListener('click', shareViaWhatsApp);
    
    // أمثلة الرسائل
    document.querySelectorAll('.example').forEach(example => {
        example.addEventListener('click', function() {
            const message = this.getAttribute('data-example');
            messageTextInput.value = message;
            messageTextInput.focus();
            updateCharCount();
            validateForm();
        });
    });
    
    // أزرار شاشة عرض الرسالة
    shareAgainBtn.addEventListener('click', shareCurrentMessage);
    createYourOwnBtn.addEventListener('click', () => {
        showScreen('welcome');
    });
}

// التحقق من وجود رسالة مشاركة في الرابط
function checkForSharedMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const messageId = urlParams.get('message');
    
    if (messageId) {
        loadSharedMessage(messageId);
    }
}

// تحميل الرسالة المشتركة
function loadSharedMessage(messageId) {
    try {
        // محاولة استرجاع الرسالة من localStorage
        const storedMessages = JSON.parse(localStorage.getItem('ramadanMessages') || '{}');
        
        if (storedMessages[messageId]) {
            messageData = storedMessages[messageId];
            displaySharedMessage();
            showScreen('view');
        } else {
            // إذا لم توجد الرسالة، عرض رسالة خطأ
            showNotification('عذراً، الرسالة غير موجودة أو انتهت صلاحيتها', 'error');
            setTimeout(() => showScreen('welcome'), 3000);
        }
    } catch (error) {
        showNotification('حدث خطأ في تحميل الرسالة', 'error');
        setTimeout(() => showScreen('welcome'), 3000);
    }
}

// عرض الرسالة المشتركة
function displaySharedMessage() {
    viewMessageText.textContent = messageData.message;
    viewSenderName.textContent = messageData.senderName || 'مستخدم كريم';
    
    // إضافة تأثيرات مرئية للرسالة
    viewMessageText.innerHTML = messageData.message
        .replace(/\n/g, '<br>')
        .replace(/رمضان/g, '<span class="highlight">رمضان</span>')
        .replace(/صيام/g, '<span class="highlight">صيام</span>')
        .replace(/قيام/g, '<span class="highlight">قيام</span>');
}

// تبديل الشاشات
function showScreen(screenName) {
    // إخفاء جميع الشاشات
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // إظهار الشاشة المطلوبة
    screens[screenName].classList.add('active');
    currentScreen = screenName;
    
    // إذا كانت شاشة الرسالة، نركز على حقل الاسم
    if (screenName === 'message') {
        setTimeout(() => {
            if (!senderNameInput.value) {
                senderNameInput.focus();
            } else {
                messageTextInput.focus();
            }
        }, 300);
    }
}

// تحديث عداد الأحرف
function updateCharCount() {
    const length = messageTextInput.value.length;
    charCount.textContent = length;
    
    // تغيير اللون إذا تجاوز 80% من الحد الأقصى
    if (length > 400) {
        charCount.style.color = '#f44336';
    } else if (length > 300) {
        charCount.style.color = '#ff9800';
    } else {
        charCount.style.color = '';
    }
}

// التحقق من صحة النموذج
function validateForm() {
    const nameValid = senderNameInput.value.trim().length > 0;
    const messageValid = messageTextInput.value.trim().length > 0;
    
    generateBtn.disabled = !(nameValid && messageValid);
    
    if (!nameValid || !messageValid) {
        generateBtn.style.opacity = '0.6';
        generateBtn.style.cursor = 'not-allowed';
    } else {
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
    }
    
    return nameValid && messageValid;
}

// إنشاء رابط المشاركة
function generateLink() {
    if (!validateForm()) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // حفظ بيانات الرسالة
    messageData = {
        senderName: senderNameInput.value.trim(),
        message: messageTextInput.value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // إنشاء معرف فريد للرسالة
    const messageId = generateMessageId();
    
    // حفظ الرسالة في localStorage
    saveMessage(messageId, messageData);
    
    // إنشاء الرابط
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?message=${messageId}`;
    
    // عرض الرابط
    generatedLink.value = shareUrl;
    
    // تحديث المعاينة
    previewText.textContent = messageData.message.substring(0, 100) + (messageData.message.length > 100 ? '...' : '');
    previewSender.textContent = messageData.senderName;
    
    // الانتقال إلى شاشة الرابط
    showScreen('link');
    
    // عرض إشعار
    showNotification('تم إنشاء رابط المشاركة بنجاح!', 'success');
}

// إنشاء معرف فريد للرسالة
function generateMessageId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `ramadan-${timestamp}-${randomStr}`;
}

// حفظ الرسالة في localStorage
function saveMessage(messageId, data) {
    try {
        const storedMessages = JSON.parse(localStorage.getItem('ramadanMessages') || '{}');
        storedMessages[messageId] = data;
        localStorage.setItem('ramadanMessages', JSON.stringify(storedMessages));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ الرسالة:', error);
        return false;
    }
}

// نسخ الرابط إلى الحافظة
function copyLink() {
    generatedLink.select();
    generatedLink.setSelectionRange(0, 99999); // للهواتف المحمولة
    
    try {
        const successful = navigator.clipboard.writeText(generatedLink.value);
        showNotification('تم نسخ الرابط إلى الحافظة!', 'success');
    } catch (err) {
        // طريقة احتياطية للمتصفحات القديمة
        document.execCommand('copy');
        showNotification('تم نسخ الرابط إلى الحافظة!', 'success');
    }
}

// مشاركة الرسالة عبر واتساب
function shareViaWhatsApp() {
    const text = `رسالة رمضانية من ${messageData.senderName}:\n\n${messageData.message.substring(0, 100)}...\n\nلقراءة الرسالة كاملة، اضغط على الرابط:\n${generatedLink.value}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
}

// مشاركة الرسالة الحالية
function shareCurrentMessage() {
    const messageId = getMessageIdFromUrl();
    if (messageId) {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?message=${messageId}`;
        
        // نسخ الرابط الجديد
        navigator.clipboard.writeText(shareUrl)
            .then(() => showNotification('تم نسخ رابط الرسالة!', 'success'))
            .catch(() => {
                // طريقة احتياطية
                const tempInput = document.createElement('input');
                tempInput.value = shareUrl;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showNotification('تم نسخ رابط الرسالة!', 'success');
            });
    }
}

// الحصول على معرف الرسالة من الرابط
function getMessageIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('message');
}

// إعادة تعيين النموذج
function resetForm() {
    senderNameInput.value = '';
    messageTextInput.value = '';
    updateCharCount();
    validateForm();
}

// عرض الإشعارات
function showNotification(text, type = 'info') {
    notificationText.textContent = text;
    
    // تغيير اللون حسب نوع الإشعار
    if (type === 'error') {
        notification.style.background = '#f44336';
    } else if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else {
        notification.style.background = 'var(--primary-dark)';
    }
    
    // عرض الإشعار
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// إضافة تأثيرات إضافية بعد تحميل الصفحة
window.addEventListener('load', function() {
    // إضافة تأثيرات للفوانيس
    const lanterns = document.querySelectorAll('.lantern');
    lanterns.forEach(lantern => {
        lantern.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 30px rgba(255, 152, 0, 0.9)';
        });
        
        lantern.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 0 20px rgba(255, 152, 0, 0.7)';
        });
    });
    
    // إضافة تأثيرات للنجوم
    const stars = document.querySelector('.stars');
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        stars.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
    });
});