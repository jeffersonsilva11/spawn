# i18n Implementation Guide

This guide explains how to add internationalization (i18n) to your existing platform without rewriting code.

## 📋 Overview

**Languages Supported:**
- English (en) - Default
- Spanish (es)
- Portuguese Brazil (pt-BR)

**Approach:**
- Frontend: `react-i18next` (industry standard)
- Backend: `nestjs-i18n` (official NestJS solution)
- Incremental migration (no full rewrite required)

---

## 🎨 Frontend Implementation (React)

### Step 1: Install Dependencies

```bash
cd packages/web-panel
npm install i18next react-i18next i18next-browser-languagedetector
```

### Step 2: Verify Folder Structure

Already created:
```
packages/web-panel/src/
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── en.json           # English translations
│       ├── es.json           # Spanish translations
│       └── pt-BR.json        # Portuguese translations
├── components/
│   ├── LanguageSwitcher.tsx  # Language switcher component
│   └── LanguageSwitcher.css  # Styles
├── main.tsx                  # Entry point (imports i18n)
└── App.tsx                   # Example usage
```

### Step 3: Initialize i18n in Your App

**In `main.tsx` (entry point):**

```typescript
import './i18n';  // Import BEFORE rendering
```

That's it! i18n auto-detects browser language and persists user selection.

### Step 4: Use Translations in Components

**Before (hardcoded):**
```tsx
<button>Deploy Server</button>
<h1>Welcome, {userName}</h1>
```

**After (translated):**
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <>
      <button>{t('servers.deploy')}</button>
      <h1>{t('dashboard.welcome', { name: userName })}</h1>
    </>
  );
}
```

### Step 5: Add Language Switcher to Header

```tsx
import { LanguageSwitcher } from './components/LanguageSwitcher';
import './components/LanguageSwitcher.css';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

### Step 6: Migration Checklist

Go through your components and replace hardcoded text:

**✅ To Replace:**
- Button labels
- Page titles
- Form labels
- Error messages
- Success messages
- Tooltips
- Placeholders

**❌ Do NOT Translate:**
- API endpoints
- Code/variable names
- Console logs (keep in English)
- Technical identifiers

**Example Migration:**

```tsx
// BEFORE
function LoginPage() {
  return (
    <form>
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button>Log In</button>
    </form>
  );
}

// AFTER
function LoginPage() {
  const { t } = useTranslation();

  return (
    <form>
      <input placeholder={t('auth.email')} />
      <input placeholder={t('auth.password')} type="password" />
      <button>{t('auth.login')}</button>
    </form>
  );
}
```

---

## 🔧 Backend Implementation (NestJS)

### Step 1: Install Dependencies

```bash
cd packages/backend
npm install nestjs-i18n
```

### Step 2: Add i18n Module to AppModule

**File: `packages/backend/src/app.module.ts`**

Add import:
```typescript
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
```

Add to `imports` array:
```typescript
I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, '/i18n/'),
    watch: true,
  },
  resolvers: [
    AcceptLanguageResolver, // Detects from Accept-Language header
  ],
}),
```

### Step 3: Use Translation Keys in Error Messages

**Before (hardcoded):**
```typescript
throw new Error('Invalid email or password');
```

**After (using keys):**
```typescript
import { I18nService } from 'nestjs-i18n';

constructor(private i18n: I18nService) {}

throw new UnauthorizedException(
  this.i18n.t('errors.auth.invalid_credentials')
);
```

**With interpolation:**
```typescript
throw new BadRequestException(
  this.i18n.t('errors.server.limit_reached', {
    args: { maxServers: studio.maxServers }
  })
);
```

### Step 4: Example: Update LoginUseCase

**File: `packages/backend/src/application/use-cases/login.use-case.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IUserRepository } from '../../domain/repositories';
import { IHashService } from '../../domain/interfaces';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly i18n: I18nService, // Add this
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('errors.auth.invalid_credentials') // Use translation key
      );
    }

    const isPasswordValid = await this.hashService.compare(
      request.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('errors.auth.invalid_credentials')
      );
    }

    return {
      userId: user.id,
      email: user.email,
      studioId: user.studioId,
    };
  }
}
```

### Step 5: Client Sends Language Header

Frontend automatically sends language in requests:

```typescript
// In your API client (axios)
axios.create({
  headers: {
    'Accept-Language': i18n.language, // en, es, or pt-BR
  }
});
```

Backend responds with localized error messages!

---

## 🗂️ Translation File Organization

### Frontend Structure

```
src/i18n/locales/en.json
{
  "common": {      // Shared across app
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {        // Feature-specific
    "login": "Log In",
    "password": "Password"
  },
  "servers": {
    "deploy": "Deploy Server",
    "status_running": "Running"
  }
}
```

**Key Naming Convention:**
- Use dot notation: `"category.subcategory.key"`
- Be semantic: `"servers.deploy"` not `"Deploy Server"`
- Group by feature: `auth`, `projects`, `servers`

### Backend Structure

```
src/i18n/en/errors.json
{
  "auth": {
    "invalid_credentials": "Invalid email or password"
  },
  "server": {
    "limit_reached": "Server limit reached. Maximum {{maxServers}} servers"
  }
}
```

---

## 🌍 Language Detection Flow

### Frontend (Auto-detect)

1. Check localStorage (`i18nextLng`) - user preference
2. Check browser language (`navigator.language`)
3. Fallback to English

User can override via `<LanguageSwitcher />`.

### Backend (Accept-Language header)

Frontend sends:
```
Accept-Language: pt-BR
```

Backend uses `nestjs-i18n` to return localized errors.

---

## ✅ Verification Checklist

### Frontend
- [ ] i18n initialized in `main.tsx`
- [ ] All UI text uses `t('key')` instead of hardcoded strings
- [ ] Language switcher added to header/nav
- [ ] Translations complete for en, es, pt-BR
- [ ] Test language switching (saves to localStorage)
- [ ] Test browser auto-detection (clear localStorage)
- [ ] Verify interpolation works: `t('key', { name: 'value' })`

### Backend
- [ ] `nestjs-i18n` installed and configured in `AppModule`
- [ ] Error messages use `this.i18n.t('errors.key')`
- [ ] Translation files created for en, es, pt-BR
- [ ] Test API with `Accept-Language: es` header
- [ ] Logs remain in English (not translated)

### Testing Different Languages

**Frontend:**
1. Open app in browser
2. Click language switcher
3. Select Spanish
4. Verify all text changes to Spanish
5. Refresh page - should stay in Spanish
6. Repeat for Portuguese

**Backend:**
1. Make API request with header:
   ```bash
   curl -H "Accept-Language: es" http://localhost:3000/auth/login \
     -d '{"email":"test","password":"wrong"}'
   ```
2. Response should have Spanish error message

---

## 🔄 Adding New Languages (Future)

### Frontend

1. Create new translation file:
   ```
   src/i18n/locales/fr.json
   ```

2. Add to `src/i18n/index.ts`:
   ```typescript
   import fr from './locales/fr.json';

   export const LANGUAGES = {
     en: { name: 'English', nativeName: 'English' },
     es: { name: 'Spanish', nativeName: 'Español' },
     'pt-BR': { name: 'Portuguese', nativeName: 'Português' },
     fr: { name: 'French', nativeName: 'Français' }, // Add this
   };

   i18n.init({
     resources: {
       en: { translation: en },
       es: { translation: es },
       'pt-BR': { translation: ptBR },
       fr: { translation: fr }, // Add this
     },
     // ... rest
   });
   ```

3. Done! Language switcher auto-updates.

### Backend

1. Create new folder:
   ```
   src/i18n/fr/errors.json
   ```

2. No code changes needed - `nestjs-i18n` auto-detects!

---

## 💡 Best Practices

### 1. Use Semantic Keys
```typescript
// ❌ Bad
t('Deploy Server')

// ✅ Good
t('servers.deploy')
```

### 2. Group by Feature
```json
{
  "servers": { ... },
  "projects": { ... },
  "auth": { ... }
}
```

### 3. Use Interpolation for Dynamic Content
```typescript
// ❌ Bad
t('welcome') + userName

// ✅ Good
t('dashboard.welcome', { name: userName })
```

### 4. Keep Logs in English
```typescript
// ✅ Correct
console.log('Server deployed successfully');
logger.error('Database connection failed');

// ❌ Don't translate logs
console.log(t('logs.server_deployed'));
```

### 5. Pluralization (Advanced)
```json
{
  "servers_count": "{{count}} server",
  "servers_count_plural": "{{count}} servers"
}
```

```typescript
t('servers_count', { count: 1 })  // "1 server"
t('servers_count', { count: 5 })  // "5 servers"
```

---

## 🐛 Troubleshooting

### Frontend: Translations Not Showing

**Check:**
1. Is i18n imported in `main.tsx`?
2. Are you using `t('key')` correctly?
3. Does the key exist in JSON files?
4. Check browser console for i18n errors

**Debug:**
```typescript
// Enable debug mode in src/i18n/index.ts
i18n.init({
  debug: true, // Shows missing keys in console
});
```

### Backend: Errors Not Translated

**Check:**
1. Is `I18nModule` added to `AppModule`?
2. Is `I18nService` injected in use case?
3. Is frontend sending `Accept-Language` header?
4. Does translation key exist in backend JSON?

**Debug:**
```typescript
// Log current language
console.log('Language:', this.i18n.lang);
```

### Language Not Persisting

**Check:**
- localStorage should have `i18nextLng` key
- Clear browser cache and test
- Ensure language switcher calls `i18n.changeLanguage()`

---

## 📊 Migration Priority

**Phase 1: High Priority (Do First)**
- [ ] Authentication pages (login, register)
- [ ] Error messages
- [ ] Navigation menu
- [ ] Dashboard overview

**Phase 2: Medium Priority**
- [ ] Projects page
- [ ] Servers page
- [ ] Settings page
- [ ] Forms and validation

**Phase 3: Low Priority**
- [ ] Documentation links
- [ ] Footer
- [ ] Less common pages

---

## 🎯 Summary

### What You Get:
✅ Clean, scalable i18n solution
✅ Auto-detect browser language
✅ Manual language switcher
✅ Persisted user preference
✅ Localized error messages from backend
✅ Easy to extend to more languages

### What to Do:
1. Install dependencies (frontend + backend)
2. Initialize i18n (already done in template files)
3. Replace hardcoded text with `t('keys')`
4. Add language switcher to header
5. Test all 3 languages

### Time Estimate:
- Setup: 30 minutes
- Migration: 2-4 hours (depends on app size)
- Testing: 1 hour

---

## 🆘 Need Help?

**Common Issues:**
- Check `docs/i18n-implementation-guide.md` (this file)
- Verify translation keys match in JSON files
- Ensure i18n is initialized before app renders
- Test with browser language auto-detection

**Resources:**
- react-i18next: https://react.i18next.com/
- nestjs-i18n: https://nestjs-i18n.com/
- i18next: https://www.i18next.com/

Good luck! 🌍
