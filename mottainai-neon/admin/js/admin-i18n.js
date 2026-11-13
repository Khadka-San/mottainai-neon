// ===== Admin Panel Translations =====
const ADMIN_LANGS = {
  en: { name: 'English', flag: '🇬🇧' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ne: { name: 'नेपाली', flag: '🇳🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  my: { name: 'မြန်မာ', flag: '🇲🇲' },
  bn: { name: 'বাংলা', flag: '🇧🇩' },
  si: { name: 'සිංහල', flag: '🇱🇰' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' }
};

const ADMIN_I18N = {
  en: {
    dashboard: 'Dashboard', analytics: 'Analytics', products: 'Products', categories: 'Categories',
    reviews: 'Reviews', coupons: 'Coupons', orders: 'Orders', payments: 'Payments',
    users: 'Customers', messages: 'Messages', settings: 'Settings', maintenance: 'Maintenance',
    logs: 'Activity Logs', profile: 'My Profile', main: 'Main', catalog: 'Catalog', sales: 'Sales',
    system: 'System', totalRevenue: 'Total Revenue', totalOrders: 'Total Orders',
    customers: 'Customers', products: 'Products', recentOrders: 'Recent Orders',
    topProducts: 'Top Products', viewAll: 'View All', add: 'Add', edit: 'Edit', delete: 'Delete',
    save: 'Save', cancel: 'Cancel', search: 'Search', filter: 'Filter', status: 'Status',
    name: 'Name', email: 'Email', price: 'Price', category: 'Category', actions: 'Actions',
    confirm: 'Confirm', back: 'Back', close: 'Close', loading: 'Loading...',
    noData: 'No data found', total: 'Total', export: 'Export', refresh: 'Refresh',
    logout: 'Logout', settings: 'Settings', language: 'Language'
  },
  ja: {
    dashboard: 'ダッシュボード', analytics: '分析', products: '商品', categories: 'カテゴリー',
    reviews: 'レビュー', coupons: 'クーポン', orders: '注文', payments: '支払い',
    users: '顧客', messages: 'メッセージ', settings: '設定', maintenance: 'メンテナンス',
    logs: 'ログ', profile: 'プロフィール', main: 'メイン', catalog: 'カタログ', sales: '売上',
    system: 'システム', totalRevenue: '総売上', totalOrders: '総注文数',
    customers: '顧客数', products: '商品数', recentOrders: '最近の注文',
    topProducts: '人気商品', viewAll: '全て表示', add: '追加', edit: '編集', delete: '削除',
    save: '保存', cancel: 'キャンセル', search: '検索', filter: 'フィルター', status: 'ステータス',
    name: '名前', email: 'メール', price: '価格', category: 'カテゴリー', actions: '操作',
    confirm: '確認', back: '戻る', close: '閉じる', loading: '読み込み中...',
    noData: 'データなし', total: '合計', export: 'エクスポート', refresh: '更新',
    logout: 'ログアウト', settings: '設定', language: '言語'
  },
  ne: {
    dashboard: 'ड्यासबोर्ड', analytics: 'विश्लेषण', products: 'उत्पादन', categories: 'कोटी',
    reviews: 'समीक्षा', coupons: 'कूपन', orders: 'अर्डर', payments: 'भुक्तानी',
    users: 'ग्राहक', messages: 'सन्देश', settings: 'सेटिङ्स', maintenance: 'मर्मत',
    logs: 'लग', profile: 'प्रोफाइल', main: 'मुख्य', catalog: 'सूची', sales: 'बिक्री',
    system: 'प्रणाली', totalRevenue: 'कुल आम्दानी', totalOrders: 'कुल अर्डर',
    customers: 'ग्राहक', products: '�त्पादन', recentOrders: 'भर्खरका अर्डर',
    topProducts: 'शीर्ष उत्पादन', viewAll: 'सबै हेर्नुहोस्', add: 'थप्नुहोस्', edit: 'सम्पादन', delete: 'मेटाउनुहोस्',
    save: 'सुरक्षित', cancel: 'रद्द', search: 'खोज्नुहोस्', filter: 'फिल्टर', status: 'स्थिति',
    name: 'नाम', email: 'इमेल', price: 'मूल्य', category: 'कोटी', actions: 'कार्य',
    confirm: 'पुष्टि', back: 'फर्क', close: 'बन्द', loading: 'लोड हुँदैछ...',
    noData: 'कुनै डाटा छैन', total: 'कुल', export: 'निर्यात', refresh: 'रिफ्रेस',
    logout: 'लगआउट', settings: 'सेटिङ्स', language: 'भा�ा'
  },
  ko: {
    dashboard: '대시보드', analytics: '분석', products: '상품', categories: '카테고리',
    reviews: '리뷰', coupons: '쿠폰', orders: '주문', payments: '결제',
    users: '고객', messages: '메시지', settings: '설정', maintenance: '유지보수',
    logs: '로그', profile: '프로필', main: '메인', catalog: '카탈로그', sales: '판매',
    system: '시스템', totalRevenue: '총 수익', totalOrders: '총 주문',
    customers: '고객', products: '상품', recentOrders: '최근 주문',
    topProducts: '인기 상품', viewAll: '전체 보기', add: '추가', edit: '편집', delete: '삭제',
    save: '저장', cancel: '취소', search: '검색', filter: '필터', status: '상태',
    name: '이름', email: '이메일', price: '가격', category: '카테고리', actions: '작업',
    confirm: '확인', back: '뒤로', close: '닫기', loading: '로딩 중...',
    noData: '데이터 없음', total: '총계', export: '내보내기', refresh: '새로고침',
    logout: '로그아웃', settings: '설정', language: '언어'
  },
  zh: {
    dashboard: '仪表板', analytics: '分析', products: '商品', categories: '类别',
    reviews: '评论', coupons: '优惠券', orders: '订单', payments: '支付',
    users: '客户', messages: '消息', settings: '设置', maintenance: '维护',
    logs: '日志', profile: '个人资料', main: '主要', catalog: '目录', sales: '销售',
    system: '系统', totalRevenue: '总收入', totalOrders: '总订单',
    customers: '客户', products: '商品', recentOrders: '最近订单',
    topProducts: '热门商品', viewAll: '查看全部', add: '添加', edit: '编辑', delete: '删除',
    save: '保存', cancel: '取消', search: '搜索', filter: '筛选', status: '状态',
    name: '名称', email: '邮箱', price: '价格', category: '类别', actions: '操作',
    confirm: '确认', back: '返回', close: '关闭', loading: '加载中...',
    noData: '暂无数据', total: '总计', export: '导出', refresh: '刷新',
    logout: '退出', settings: '设置', language: '语言'
  },
  vi: {
    dashboard: 'Bảng điều khiển', analytics: 'Phân tích', products: 'Sản phẩm', categories: 'Danh mục',
    reviews: 'Đánh giá', coupons: 'Mã giảm giá', orders: 'Đơn hàng', payments: 'Thanh toán',
    users: 'Khách hàng', messages: 'Tin nhắn', settings: 'Cài đặt', maintenance: 'Bảo trì',
    logs: 'Nhật ký', profile: 'Hồ sơ', main: 'Chính', catalog: 'Danh mục', sales: 'Bán hàng',
    system: 'Hệ thống', totalRevenue: 'Tổng doanh thu', totalOrders: 'Tổng đơn hàng',
    customers: 'Khách hàng', products: 'Sản phẩm', recentOrders: 'Đơn hàng gần đây',
    topProducts: 'Sản phẩm hàng đầu', viewAll: 'Xem tất cả', add: 'Thêm', edit: 'Sửa', delete: 'Xóa',
    save: 'Lưu', cancel: 'Hủy', search: 'Tìm kiếm', filter: 'Lọc', status: 'Trạng thái',
    name: 'Tên', email: 'Email', price: 'Giá', category: 'Danh mục', actions: 'Hành động',
    confirm: 'Xác nhận', back: 'Quay lại', close: 'Đóng', loading: 'Đang tải...',
    noData: 'Không có dữ liệu', total: 'Tổng', export: 'Xuất', refresh: 'Làm mới',
    logout: 'Đăng xuất', settings: 'Cài đặt', language: 'Ngôn ngữ'
  },
  my: {
    dashboard: 'ဒက်ရှ်ဘုတ်', analytics: 'ခွဲခြမ်းစ�တ်ဖြာမှု', products: 'ထုတ်ကုန်', categories: 'အမျိုးအစား',
    reviews: 'သုံးသပ်ချက်', coupons: 'ကူပွန်', orders: 'မှာယူမှု', payments: 'ငွေပေးချေမှု',
    users: 'ဖောက်သည်', messages: 'မက်ဆေ့ချ်', settings: 'ဆက်တင်', maintenance: 'ပြုပြင်ထိန်းသိမ်းမှု',
    logs: 'မှတ်တမ်း', profile: 'ပရိုဖိုင်', main: 'အဓိက', catalog: 'စာရင်း', sales: 'ရ�ာင်းချ',
    system: 'စနစ်', totalRevenue: 'စုစုပေါင်းဝင်ငွေ', totalOrders: 'စုစုပေါ�်းမှာယူမှ�',
    customers: 'ဖောက်သည်', products: 'ထုတ်ကုန်', recentOrders: 'မကြာသေးမီမှာယူမှု',
    topProducts: 'ထိပ်ဆုံးထုတ်ကုန်', viewAll: 'အားလုံးကြည့်ရှု', add: 'ထည့်မည်', edit: 'တည်းဖြတ်', delete: 'ဖျက်မည်',
    save: 'သိမ်းမည်', cancel: 'ပယ်ဖျက်မည�', search: 'ရှာဖွေ', filter: 'စစ်ထုတ်', status: 'အခြေအနေ',
    name: 'အ�ည်', email: 'အီးမေးလ်', price: 'စျေးနှုန်�', category: 'အမျိုးအစား', actions: 'လုပ်ဆောင်ချ�်',
    confirm: 'အတည်ပြ�', back: 'နောက်သို့', close: 'ပိတ်မည်', loading: 'ဖွင့်နေသည�...',
    noData: 'အချက်အလက်မရှိ', total: 'စုစ�ပေါင်း', export: 'ထုတ်ယူ', refresh: 'ပြန်ဖွင့်',
    logout: 'ထွက်ရန်', settings: 'ဆက်တ�်', language: 'ဘာသာစကား'
  },
  bn: {
    dashboard: 'ড্যাশবোর্�', analytics: 'বিশ্লেষণ', products: 'পণ্য', categories: 'বিভাগ',
    reviews: 'রিভিউ', coupons: 'কুপন', orders: 'অর্ডার', payments: 'পেমেন্ট',
    users: 'গ্রাহক', messages: 'বার্তা', settings: 'সেটিংস', maintenance: 'রক্ষণাবেক্ষণ',
    logs: 'লগ', profile: 'প্রো�াইল', main: 'মূল', catalog: 'ক্যাটালগ', sales: 'বিক্রয়',
    system: 'সিস্টে�', totalRevenue: 'মোট আয়', totalOrders: 'মোট অর্ডার',
    customers: 'গ্রাহক', products: 'পণ্য', recentOrders: 'সাম্প্রতিক অর্ডার',
    topProducts: 'শীর্ষ পণ্য', viewAll: 'সব দেখুন', add: 'যোগ', edit: 'সম্পাদনা', delete: 'মুছুন',
    save: 'সংরক্ষণ', cancel: 'বাতিল', search: 'অনুসন্ধান', filter: 'ফিল্টার', status: 'অবস্থা',
    name: 'নাম', email: 'ইমেল', price: 'মূল্য', category: 'বিভাগ', actions: 'কর্ম',
    confirm: 'নিশ্চিত', back: 'পেছনে', close: 'বন্ধ', loading: 'লোড হচ্ছে...',
    noData: 'কোন ডেটা নেই', total: 'মোট', export: 'রপ্তানি', refresh: 'রিফ্রেশ',
    logout: 'লগআউট', settings: 'সেটিংস', language: 'ভাষা'
  },
  si: {
    dashboard: 'උප�රණ පුවරුව', analytics: 'විශ්ලේෂණ', products: '�ිෂ්පාදන', categories: 'ක�ණ්ඩ',
    reviews: 'සමාලෝචන', coupons: 'කූපන', orders: '�ණවුම්', payments: 'ගෙවීම්',
    users: 'ගනුද�නුකරුවන්', messages: 'පණිවිඩ', settings: 'සැකසුම්', maintenance: 'නඩත්තු',
    logs: 'සටහන්', profile: 'පැතිකිරිය', main: 'ප්‍රධාන', catalog: 'නාමාවිශ්‍යාව', sales: 'විකුණුම්',
    system: 'පද්ධතිය', totalRevenue: 'සම්පූර්ණ �දායම', totalOrders: 'සම්ප�ර්ණ ඇණවුම්',
    customers: 'ගනුදෙනුකරුවන්', products: 'නිෂ්පාදන', recentOrders: 'මෑත ඇණවු�්',
    topProducts: 'ඉහළම නිෂ්පාදන', viewAll: 'සියල්ල බලන්න', add: 'එකතු කරන්න', edit: 'සංස්කරණය', delete: 'මකන්න',
    save: 'සු�කින්න', cancel: 'අවලංගු කරන්න', search: 'සොයන්න', filter: 'පෙරහන', status: 'තත්ත්වය',
    name: 'නම', email: 'ඊම�ල්', price: 'මිල', category: 'කාණ්ඩය', actions: 'ක්‍ර�යා',
    confirm: 'තහවුරු කරන්න', back: 'ආපසු', close: 'වසන්න', loading: '�ූරණය වෙමින්...',
    noData: 'දත්ත නැත', total: 'එකතුව', export: 'නිර්යාත කරන�න', refresh: 'නැවුම් කරන්න',
    logout: 'ඉවත් වන්න', settings: 'සැ�සුම්', language: 'භාෂාව'
  },
  hi: {
    dashboard: 'डैशबोर्ड', analytics: 'विश्लेषण', products: 'उत्पाद', categories: 'श्रेणियाँ',
    reviews: 'समीक्षाएं', coupons: 'कूपन', orders: 'ऑर्डर', payments: 'भुगतान',
    users: 'ग्राहक', messages: 'संदेश', settings: 'सेटिंग्स', maintenance: 'रखरखाव',
    logs: 'लॉग', profile: 'प्रोफाइल', main: 'मुख्य', catalog: 'कैटलॉग', sales: 'बिक्री',
    system: 'सिस्टम', totalRevenue: 'कुल राजस्व', totalOrders: 'कुल �र्डर',
    customers: 'ग्राहक', products: 'उत्पाद', recentOrders: 'हाल के ऑर्डर',
    topProducts: 'शीर्ष उत्पाद', viewAll: 'सभी देखें', add: 'जोड़ें', edit: 'संपादित करें', delete: 'हटाएं',
    save: 'सहेजें', cancel: 'रद्द करें', search: 'खोजें', filter: 'फिल्टर', status: 'स्थिति',
    name: 'नाम', email: 'ईमेल', price: 'कीमत', category: 'श्रेणी', actions: 'क्रिया�ं',
    confirm: 'पुष्टि करें', back: 'वापस', close: 'बंद करें', loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा नहीं', total: 'कुल', export: 'निर्यात', refresh: 'रिफ्रेश',
    logout: 'लॉगआउट', settings: 'सेटिंग्स', language: 'भाषा'
  }
};

let adminLang = localStorage.getItem('mn_admin_lang') || 'en';

function adminT(key) {
  return (ADMIN_I18N[adminLang] && ADMIN_I18N[adminLang][key]) || ADMIN_I18N.en[key] || key;
}

function setAdminLang(lang) {
  if (!ADMIN_LANGS[lang]) return;
  adminLang = lang;
  localStorage.setItem('mn_admin_lang', lang);
  applyAdminTranslations();
  showAdminLangPicker();
}

function applyAdminTranslations() {
  document.querySelectorAll('[data-admin-i18n]').forEach(el => {
    const key = el.getAttribute('data-admin-i18n');
    el.textContent = adminT(key);
  });
  const sel = document.getElementById('adminLangSelect');
  if (sel) sel.value = adminLang;
  // Refresh current page
  if (typeof showPage === 'function' && typeof currentPage !== 'undefined') {
    showPage(currentPage);
  }
}

function showAdminLangPicker() {
  showAdminModal(`
    <h3>🌐 Select Language / 言語選択 / भाषा चुनें</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
      ${Object.entries(ADMIN_LANGS).map(([code, lang]) => `
        <div class="menu-item" onclick="setAdminLang('${code}')" style="cursor:pointer;padding:10px">
          <div class="left">
            <span style="font-size:20px;margin-right:8px">${lang.flag}</span>
            <span>${lang.name}</span>
          </div>
          ${adminLang === code ? '<span style="color:var(--success)">✓</span>' : ''}
        </div>
      `).join('')}
    </div>
  `);
}
