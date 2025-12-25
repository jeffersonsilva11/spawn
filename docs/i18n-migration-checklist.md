# i18n Migration Checklist

Use this checklist to track your i18n implementation progress.

## 📦 Installation

### Frontend
- [ ] Install i18n packages
  ```bash
  cd packages/web-panel
  npm install i18next react-i18next i18next-browser-languagedetector
  ```

### Backend
- [ ] Install nestjs-i18n
  ```bash
  cd packages/backend
  npm install nestjs-i18n
  ```

---

## ⚙️ Configuration

### Frontend
- [x] Create `src/i18n/index.ts` *(already created)*
- [x] Create translation files:
  - [x] `src/i18n/locales/en.json`
  - [x] `src/i18n/locales/es.json`
  - [x] `src/i18n/locales/pt-BR.json`
- [ ] Import i18n in `main.tsx`
- [x] Create `LanguageSwitcher` component *(already created)*

### Backend
- [x] Create backend translation files:
  - [x] `src/i18n/en/errors.json`
  - [x] `src/i18n/es/errors.json`
  - [x] `src/i18n/pt-BR/errors.json`
- [ ] Add `I18nModule` to `AppModule`
- [ ] Inject `I18nService` in use cases that throw errors

---

## 🔄 Code Migration

### Frontend Components to Update

#### Authentication
- [ ] Login page
  - [ ] Email label/placeholder
  - [ ] Password label/placeholder
  - [ ] Login button
  - [ ] "Forgot password" link
  - [ ] "Create account" link
  - [ ] Error messages
- [ ] Register page
  - [ ] Form labels
  - [ ] Submit button
  - [ ] Validation messages

#### Navigation
- [ ] Header/navbar
  - [ ] Navigation links (Dashboard, Projects, Servers, Settings)
  - [ ] Add `<LanguageSwitcher />` component
- [ ] Sidebar (if applicable)

#### Dashboard
- [ ] Page title
- [ ] Welcome message
- [ ] Stats labels (Active Servers, Total Projects, etc.)
- [ ] Quick actions buttons

#### Projects Page
- [ ] Page title
- [ ] "Create Project" button
- [ ] Table headers (Name, Description, Created)
- [ ] Empty state message
- [ ] Create/Edit form labels
- [ ] Delete confirmation dialog

#### Servers Page
- [ ] Page title
- [ ] "Deploy Server" button
- [ ] Table headers (Status, IP, Port, etc.)
- [ ] Status labels (Running, Stopped, etc.)
- [ ] Connection info labels
- [ ] Stop/Restart buttons
- [ ] Deploy confirmation dialog

#### Builds Page
- [ ] Upload button
- [ ] Version label
- [ ] Status labels
- [ ] Upload instructions
- [ ] File size/format messages

#### Settings Page
- [ ] Section titles
- [ ] Form labels
- [ ] API key labels
- [ ] Save button
- [ ] Success/error messages

#### Common Components
- [ ] Buttons (Save, Cancel, Delete, etc.)
- [ ] Loading indicators
- [ ] Error messages
- [ ] Success messages
- [ ] Tooltips
- [ ] Modal dialogs
- [ ] Form validation messages

### Backend Use Cases to Update

#### Auth Use Cases
- [ ] `RegisterStudioUseCase`
  - [ ] "Email already exists" error
  - [ ] Validation errors
- [ ] `LoginUseCase`
  - [ ] "Invalid credentials" error
  - [ ] "Unauthorized" error

#### Project Use Cases
- [ ] `CreateProjectUseCase`
  - [ ] Validation errors
- [ ] Other project use cases
  - [ ] "Project not found" error
  - [ ] "Unauthorized" error

#### Server Use Cases
- [ ] `DeployServerUseCase`
  - [ ] "Server limit reached" error
  - [ ] "No available ports" error
  - [ ] "Deploy failed" error
- [ ] `StopServerUseCase`
  - [ ] "Cannot stop" error
  - [ ] "Stop failed" error
- [ ] `GetOrCreateServerUseCase`
  - [ ] "No available servers" error

#### Build Use Cases
- [ ] `UploadBuildUseCase`
  - [ ] "File too large" error
  - [ ] "Upload failed" error
  - [ ] "Invalid format" error

---

## 🧪 Testing

### Manual Testing
- [ ] Test English (default)
  - [ ] All pages display English text
  - [ ] Error messages in English
- [ ] Test Spanish
  - [ ] Switch language via `<LanguageSwitcher />`
  - [ ] All pages display Spanish text
  - [ ] Trigger errors - should be in Spanish
- [ ] Test Portuguese
  - [ ] Switch language
  - [ ] Verify all text displays correctly
  - [ ] Test error messages

### Auto-Detection Testing
- [ ] Clear localStorage
- [ ] Set browser language to Spanish
- [ ] Open app - should auto-detect Spanish
- [ ] Set browser to Portuguese - should auto-detect
- [ ] Set browser to unsupported language - should fallback to English

### Persistence Testing
- [ ] Select Spanish
- [ ] Refresh page - should stay Spanish
- [ ] Close browser, reopen - should stay Spanish
- [ ] Test across browser tabs

### Backend Testing
- [ ] Test API with `Accept-Language: es` header
  ```bash
  curl -H "Accept-Language: es" \
       -X POST http://localhost:3000/auth/login \
       -d '{"email":"test","password":"wrong"}'
  ```
  - [ ] Error message should be in Spanish

- [ ] Test API with `Accept-Language: pt-BR`
  - [ ] Error message should be in Portuguese

- [ ] Test API with no header
  - [ ] Should default to English

### Edge Cases
- [ ] Test very long text in different languages
- [ ] Test special characters (accents, ñ, ç)
- [ ] Test RTL languages (if adding Arabic/Hebrew later)
- [ ] Test interpolation: `t('key', { name: 'value' })`
- [ ] Test pluralization (if using)

---

## 📝 Content Review

### Translation Quality
- [ ] Review English translations
  - [ ] Professional tone
  - [ ] Consistent terminology
  - [ ] No typos
- [ ] Review Spanish translations
  - [ ] Native speaker review
  - [ ] Culturally appropriate
  - [ ] Formal/informal "you" (usted vs tú)
- [ ] Review Portuguese translations
  - [ ] Brazilian Portuguese (not European)
  - [ ] Native speaker review
  - [ ] Culturally appropriate

### Consistency Check
- [ ] Same term used consistently
  - [ ] "Server" → "Servidor" (not "Servicio")
  - [ ] "Deploy" → "Desplegar/Implantar" (pick one)
  - [ ] "Build" → "Build" (keep technical terms?)
- [ ] Button text consistent
  - [ ] All "Save" buttons use same translation
  - [ ] All "Cancel" buttons use same translation

---

## 🚀 Deployment

### Pre-Deployment
- [ ] Remove debug mode in production
  ```typescript
  // src/i18n/index.ts
  debug: process.env.NODE_ENV === 'development'
  ```
- [ ] Verify all translation files committed
- [ ] Test production build
  ```bash
  npm run build
  npm run preview
  ```

### Post-Deployment
- [ ] Test on staging environment
- [ ] Verify language switcher works
- [ ] Test with real users (Spanish/Portuguese speakers)
- [ ] Monitor for missing translation keys
- [ ] Check analytics for language usage

---

## 📊 Completion Tracking

### Overall Progress
- Frontend Setup: __ / 4 items
- Backend Setup: __ / 3 items
- Frontend Migration: __ / ~40 components
- Backend Migration: __ / ~10 use cases
- Testing: __ / 18 test scenarios
- Content Review: __ / 6 items
- Deployment: __ / 6 items

**Total Progress: ____%**

---

## 🎯 Quick Wins (Start Here)

If you're just starting, do these first for maximum impact:

1. **Authentication Flow** (30 min)
   - Login page
   - Register page
   - Error messages

2. **Navigation** (15 min)
   - Header links
   - Add language switcher

3. **Common Buttons** (10 min)
   - Save, Cancel, Delete, Create

4. **Error Messages** (20 min)
   - Update all backend use cases

**Total: ~75 minutes for 80% coverage**

---

## 📞 Support

If you get stuck:
1. Check `docs/i18n-implementation-guide.md`
2. Search for missing keys in console (debug mode)
3. Verify JSON syntax in translation files
4. Test with simple component first, then expand

---

**Last Updated:** 2024-12-25
**Status:** Ready for implementation
