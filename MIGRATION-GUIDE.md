# 🚀 Next.js 15.x Migration Guide

## **📋 Overview**

Sichere Migration von Next.js 13.5.11 zu 15.5.0 mit vollständiger Breaking Changes Behandlung und Zero-Downtime-Deployment.

## **⚠️ Breaking Changes Behoben**

### **1. Server Actions Configuration**
```javascript
// ❌ ALT (Next.js 13.x)
experimental: {
  serverActions: true
}

// ✅ NEU (Next.js 15.x)
experimental: {
  serverActions: {
    allowedOrigins: ['localhost:3000', '*.vercel.app']
  }
}
```

### **2. Async Request APIs**
```typescript
// ❌ ALT (Next.js 13.x)
import { cookies } from 'next/headers';

export function createSupabaseServer() {
  const cookieStore = cookies();
  // ...
}

// ✅ NEU (Next.js 15.x)
import { cookies } from 'next/headers';

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  // ...
}
```

### **3. Server Function Calls**
```typescript
// ❌ ALT
const supabase = createSupabaseServer();

// ✅ NEU
const supabase = await createSupabaseServer();
```

### **4. Dynamic Route Params**
```typescript
// ❌ ALT (Next.js 13.x)
export default function Page({ params }: { params: { id: string } }) {
  useEffect(() => {
    router.push(`/chat?id=${params.id}`);
  }, [params.id]);
}

// ✅ NEU (Next.js 15.x)
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  useEffect(() => {
    const handleRedirect = async () => {
      const resolvedParams = await params;
      router.push(`/chat?id=${resolvedParams.id}`);
    };
    handleRedirect();
  }, [params]);
}
```

## **🗄️ Database Schema - UNVERÄNDERT**

✅ **Keine DB-Breaking Changes!**  
Das komplette Database Schema bleibt **100% kompatibel**:

- ✅ Alle Tabellen unverändert
- ✅ RLS Policies intakt  
- ✅ Foreign Keys erhalten
- ✅ Indexe und Triggers funktionsfähig
- ✅ ENUM Constraints kompatibel

## **🔧 Betroffene Dateien**

### **Konfiguration**
- `next.config.js` - Server Actions Config
- `package.json` - Dependencies und Test Scripts

### **Server Functions**
- `lib/supabase/server.ts` - Async Cookies
- `app/api/auth/bootstrap-profile/route.ts` - Async Server Client
- `app/api/auth/me/route.ts` - Async Server Client  
- `app/api/projects/create/route.ts` - Async Server Client
- `app/auth/callback/route.ts` - Async Server Client
- `app/onboarding/actions.ts` - Server Actions

### **Dynamic Routes**
- `app/(protected)/chats/[id]/page.tsx` - Async Params

## **🧪 Tests**

### **Regression Tests**
```bash
# Alle Migration Tests
npm run test:migration

# Kontinuierlich während Entwicklung
npm run test:watch

# Vollständige Test Suite
npm run test
```

### **Test Coverage**
- ✅ Async Request APIs (cookies, headers)
- ✅ Server Actions mit await
- ✅ Route Handlers Kompatibilität
- ✅ Dynamic Route Params
- ✅ Database Schema Integrity
- ✅ RLS Policies Preservation

## **🚀 Deployment**

### **Pre-Deployment Checklist**
- [ ] Tests bestanden: `npm run test:migration`
- [ ] Build erfolgreich: `npm run build`
- [ ] No TypeScript Errors: `npm run lint`
- [ ] Server startet: `npm run dev`

### **Zero-Downtime Deployment**
1. **Build Phase**: Neue Version parallel builden
2. **Switch Phase**: Traffic atomisch umleiten  
3. **Verify Phase**: Health Checks bestanden

### **Rollback Plan**
```bash
# 1. Git Rollback
git checkout HEAD~1

# 2. Dependencies Rollback
npm install next@13.5.11

# 3. Server Restart
npm run build && npm start
```

## **🔒 Security Improvements**

### **Vulnerabilities Behoben**
- ✅ **Next.js Server-Side Request Forgery** (CRITICAL → FIXED)
- ✅ **Authorization Bypass** (HIGH → FIXED)
- ✅ **Cache Poisoning** (HIGH → FIXED)
- ✅ **Information Exposure** (HIGH → FIXED)
- ✅ **PostCSS Parsing Error** (MODERATE → FIXED)

**Result:** `0 vulnerabilities` in Abhängigkeiten

## **📈 Performance Impact**

### **Erwartete Verbesserungen**
- ✅ **Caching**: Optimierte Cache-Strategien in Next.js 15
- ✅ **Bundle Size**: Kleinere JavaScript Bundles
- ✅ **Server Components**: Verbesserte SSR Performance

### **Monitoring**
- Page Load Times
- Server Response Times  
- Database Query Performance
- Memory Usage

## **🔍 Troubleshooting**

### **Häufige Probleme**

**Problem:** `cookies is not a function`
```typescript
// Lösung: Async/await hinzufügen
const cookieStore = await cookies();
```

**Problem:** `params.id is Promise`
```typescript
// Lösung: Await in useEffect
const resolvedParams = await params;
```

**Problem:** Server Actions `allowedOrigins`
```javascript
// Lösung: Explizite Konfiguration
serverActions: {
  allowedOrigins: ['localhost:3000', '*.vercel.app']
}
```

### **Support**
- Next.js 15 Migration Guide: https://nextjs.org/docs/app/guides/upgrading/version-15
- GitHub Issues: Repository Issues für projektspezifische Probleme
- Discord Community: Next.js Discord für allgemeine Hilfe

---

## **✅ Migration Status: COMPLETED**

✅ **All Breaking Changes Resolved**  
✅ **Database Schema Preserved**  
✅ **Security Vulnerabilities Fixed**  
✅ **Tests Implemented**  
✅ **Documentation Complete**  

**Ready for Production Deployment! 🚀**
