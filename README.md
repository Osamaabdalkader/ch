# ch

# تطبيق نظام الرسائل باستخدام Firebase

تطبيق ويب لنظام الرسائل بين المستخدمين والإدارة باستخدام Firebase.

## الميزات

- تسجيل الدخول وإنشاء حساب للمستخدمين
- إرسال رسائل من المستخدمين إلى الإدارة
- إرسال رسائل من الإدارة إلى المستخدمين
- عرض المحادثات في الوقت الحقيقي
- إشعارات الرسائل غير المقروءة
- واجهة مستخدم عربية متجاوبة

## المتطلبات

- حساب Firebase
- متصفح ويب حديث

## إعداد المشروع

1. قم بإنشاء مشروع جديد في Firebase
2. أضف تطبيق ويب واحصل على بيانات التهيئة
3. استبدل بيانات التهيئة في `firebase-config.js`
4. قم بتفعيل خدمة المصادقة باستخدام البريد الإلكتروني/كلمة المرور
5. قم بتهيئة قاعدة البيانات في Realtime Database

## كيفية الاستخدام

1. قم بفتح `index.html` في المتصفح
2. سجل الدخول بحساب مستخدم عادي للوصول إلى صفحة المستخدم
3. سجل الدخول بحساب مدير للوصول إلى لوحة التحكم
4. يمكنك إرسال واستقبال الرسائل بين المستخدمين والإدارة

## بنية المشروع

- `index.html`: صفحة تسجيل الدخول/التسجيل
- `user.html`: صفحة المستخدم لإرسال واستقبال الرسائل
- `admin.html`: لوحة تحكم الإدارة
- `firebase-config.js`: تهيئة Firebase
- `auth.js`: معالجة المصادقة والتسجيل
- `user-messaging.js`: منطق الرسائل للمستخدم
- `admin-panel.js`: منطق لوحة التحكم للإدارة
- `style.css`: ملف التصميم

## قواعد الأمان الموصى بها

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "messages": {
      "$messageId": {
        ".read": "auth != null && (data.child('senderId').val() == auth.uid || data.child('receiverId').val() == auth.uid)",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['senderId', 'receiverId', 'content', 'timestamp', 'isRead'])"
      }
    }
  }
}
