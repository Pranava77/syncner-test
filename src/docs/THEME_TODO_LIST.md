# 🎨 Theme Implementation TODO List

## 🚨 **CRITICAL PRIORITY - Must Complete First**

### **1. AdminCurriculum.tsx** ⏱️ **45-60 minutes**
**Status**: ❌ **MOST CRITICAL** - 50+ hardcoded colors  
**Impact**: Admin curriculum management interface - high user impact  
**Complexity**: High (forms, tables, multiple UI elements)

**TODO Items:**
- [ ] **Background Colors**: Replace `bg-trueturquoise`, `bg-paperwhite/10`, `bg-black`
- [ ] **Text Colors**: Replace `text-teallight`, `text-paperwhite`, `text-trueturquoise`
- [ ] **Border Colors**: Replace `border-paperwhite/20`, `border-trueturquoise`
- [ ] **Form Elements**: Update all input fields, textareas, checkboxes
- [ ] **Buttons**: Update all buttons with hardcoded colors
- [ ] **Tables**: Update table styling and hover effects
- [ ] **Progress Indicators**: Update status badges and progress bars
- [ ] **Loading States**: Update spinner and loading elements
- [ ] **Modal Elements**: Update any modal backgrounds and content

**Files to Update:**
- `src/pages/AdminCurriculum.tsx`

---

### **2. StudentDashboard.tsx** ⏱️ **30-45 minutes**
**Status**: ❌ **CRITICAL** - 25+ hardcoded colors  
**Impact**: Main student interface - critical user experience  
**Complexity**: High (multiple sections, progress indicators)

**TODO Items:**
- [ ] **Progress Indicators**: Replace `bg-trueturquoise`, `bg-paperwhite/20`
- [ ] **Text Labels**: Replace `text-teallight` throughout
- [ ] **Buttons**: Update all buttons with hardcoded colors
- [ ] **Progress Bars**: Update progress bar backgrounds
- [ ] **Status Indicators**: Update completion badges and status
- [ ] **Charts**: Update chart colors and backgrounds
- [ ] **Navigation Elements**: Update any navigation styling

**Files to Update:**
- `src/pages/StudentDashboard.tsx`

---

### **3. AdminAdmin.tsx** ⏱️ **30-45 minutes**
**Status**: ❌ **CRITICAL** - 20+ hardcoded colors  
**Impact**: Admin user management - high administrative impact  
**Complexity**: Medium (tables, forms, buttons)

**TODO Items:**
- [ ] **Buttons**: Replace `bg-trueturquoise`, `bg-rust`
- [ ] **Text Colors**: Replace `text-teallight`
- [ ] **Form Focus States**: Update focus rings and borders
- [ ] **Table Rows**: Update hover effects
- [ ] **Status Indicators**: Update active/inactive status
- [ ] **Modal Elements**: Update modal styling
- [ ] **Password Display**: Update password box styling

**Files to Update:**
- `src/pages/AdminAdmin.tsx`

---

### **4. AdminStaff.tsx** ⏱️ **30-45 minutes**
**Status**: ❌ **CRITICAL** - 20+ hardcoded colors  
**Impact**: Staff management - high administrative impact  
**Complexity**: Medium (similar to AdminAdmin.tsx)

**TODO Items:**
- [ ] **Buttons**: Replace `bg-trueturquoise`, `bg-rust`
- [ ] **Text Colors**: Replace `text-teallight`
- [ ] **Form Focus States**: Update focus rings and borders
- [ ] **Table Rows**: Update hover effects
- [ ] **Status Indicators**: Update active/inactive status
- [ ] **Modal Elements**: Update modal styling
- [ ] **Password Display**: Update password box styling

**Files to Update:**
- `src/pages/AdminStaff.tsx`

---

## 🟡 **HIGH PRIORITY - Complete After Critical**

### **5. LoginPage.tsx** ⏱️ **20-30 minutes**
**Status**: ❌ **HIGH PRIORITY** - 5+ hardcoded colors  
**Impact**: First impression, user authentication  
**Complexity**: Medium (forms, buttons, error messages)

**TODO Items:**
- [ ] **Error Messages**: Replace `bg-rust/10`, `border-rust/20`
- [ ] **Icon Colors**: Replace `text-teallight`
- [ ] **Button Styling**: Replace `bg-trueturquoise`, `text-offblack`
- [ ] **Form Elements**: Update any hardcoded form styling
- [ ] **Hover Effects**: Update button hover states

**Files to Update:**
- `src/pages/LoginPage.tsx`

---

### **6. AdminProfile.tsx** ⏱️ **15-20 minutes**
**Status**: ❌ **HIGH PRIORITY** - 3+ hardcoded colors  
**Impact**: Admin profile management  
**Complexity**: Low (simple forms and buttons)

**TODO Items:**
- [ ] **Message Styling**: Update success/error message colors
- [ ] **Button Colors**: Replace `bg-trueturquoise`
- [ ] **Status Indicators**: Update any status colors

**Files to Update:**
- `src/pages/AdminProfile.tsx`

---

### **7. AdminSettings.tsx** ⏱️ **15-20 minutes**
**Status**: ❌ **HIGH PRIORITY** - 2+ hardcoded colors  
**Impact**: Admin settings interface  
**Complexity**: Low (simple components)

**TODO Items:**
- [ ] **Loading Spinner**: Replace `border-paperwhite`
- [ ] **Text Colors**: Replace `text-teallight`
- [ ] **Form Elements**: Update any hardcoded styling

**Files to Update:**
- `src/pages/AdminSettings.tsx`

---

### **8. StaffDashboard.tsx** ⏱️ **10-15 minutes**
**Status**: ❌ **HIGH PRIORITY** - 1+ hardcoded colors  
**Impact**: Staff dashboard interface  
**Complexity**: Low (simple component)

**TODO Items:**
- [ ] **Button Styling**: Replace `bg-rust`
- [ ] **Any Other Elements**: Check for additional hardcoded colors

**Files to Update:**
- `src/pages/StaffDashboard.tsx`

---

## 🟢 **MEDIUM PRIORITY - Complete Last**

### **9. LevelsSidebar.tsx** ⏱️ **20-30 minutes**
**Status**: ❌ **MEDIUM PRIORITY** - 10+ hardcoded colors  
**Impact**: Navigation component - used across multiple pages  
**Complexity**: Medium (navigation states, progress indicators)

**TODO Items:**
- [ ] **Progress Indicators**: Replace `bg-paperwhite/10`, `bg-paperwhite/5`
- [ ] **Navigation States**: Update active/inactive states
- [ ] **Loading Skeletons**: Update skeleton colors
- [ ] **Hover Effects**: Update hover state colors
- [ ] **Text Colors**: Replace `text-teallight`
- [ ] **Border Colors**: Replace `border-paperwhite/10`

**Files to Update:**
- `src/components/LevelsSidebar.tsx`

---

### **10. Remaining Pages to Check** ⏱️ **30-45 minutes total**
**Status**: 🔍 **NEEDS AUDIT** - Potential hardcoded colors  
**Impact**: Various user interfaces  
**Complexity**: Unknown (need to audit first)

**TODO Items:**
- [ ] **ProjectsPage.tsx**: Audit for hardcoded colors
- [ ] **StudentProfile.tsx**: Audit for hardcoded colors
- [ ] **TrainingLevelDetail.tsx**: Audit for hardcoded colors
- [ ] **RegisterPage.tsx**: Audit for hardcoded colors
- [ ] **AdminUsers.tsx**: Audit for hardcoded colors

**Files to Update:**
- `src/pages/ProjectsPage.tsx`
- `src/pages/StudentProfile.tsx`
- `src/pages/TrainingLevelDetail.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/AdminUsers.tsx`

---

## ✅ **COMPLETED - No Action Needed**

### **Pages (Already Themed)**
- [x] `src/pages/LandingPage.tsx`
- [x] `src/pages/LevelLearnPage.tsx`
- [x] `src/pages/LevelTestPage.tsx`
- [x] `src/pages/LevelExercisePage.tsx`
- [x] `src/pages/AdminAnalytics.tsx`
- [x] `src/pages/TrainingLevels.tsx`
- [x] `src/pages/AdminDashboard.tsx`
- [x] `src/pages/OnboardingFlow.tsx`

### **Components (Already Themed)**
- [x] `src/components/ErrorBoundary.tsx`
- [x] `src/components/LoadingScreen.tsx`
- [x] `src/components/LevelProgressChart.tsx`
- [x] `src/components/LevelStatus.tsx`
- [x] `src/components/ResetPasswordModal.tsx`
- [x] `src/components/TaskSubmissionModal.tsx`
- [x] `src/components/AIChat.tsx`
- [x] `src/components/ThemeSwitcher.tsx`
- [x] `src/components/ThemeText.tsx`
- [x] `src/components/ThemeContainer.tsx`
- [x] `src/components/Layout.tsx`
- [x] `src/components/ProtectedRoute.tsx`

---

## 📊 **Implementation Summary**

### **Total Files to Update**: 19
### **Total Estimated Time**: 3-4 hours
### **Priority Breakdown**:
- **Critical**: 4 files (2-3 hours)
- **High Priority**: 4 files (1-1.5 hours)
- **Medium Priority**: 11 files (1-1.5 hours)

### **Recommended Order**:
1. **AdminCurriculum.tsx** (start here - most complex)
2. **StudentDashboard.tsx** (high user impact)
3. **AdminAdmin.tsx** & **AdminStaff.tsx** (parallel work)
4. **LoginPage.tsx** (user experience)
5. **Quick wins**: AdminProfile.tsx, AdminSettings.tsx, StaffDashboard.tsx
6. **LevelsSidebar.tsx** (navigation component)
7. **Remaining pages** (audit and update as needed)

---

**Status**: 🚧 **READY FOR IMPLEMENTATION**  
**Next Action**: Begin with AdminCurriculum.tsx  
**Goal**: 100% theme compliance across all files
