# PageMade Documentation Index

Chào mừng đến với tài liệu kỹ thuật của PageMade! Đây là danh mục đầy đủ các tài liệu hướng dẫn cho developers và AI agents.

---

## ⚠️ ĐỌC TRƯỚC TIÊN

### 🚨 [/PROJECT_RULES.md](../PROJECT_RULES.md)
**MANDATORY FOR ALL AI AGENTS**

**Nội dung**:
- 🚫 7 quy tắc vàng về quản lý file
- 📝 Khi nào tạo file mới (hầu như KHÔNG BAO GIỜ!)
- ✏️ Khi nào update file hiện có (hầu như LUÔN LUÔN!)
- 📊 Naming convention cho temporary files
- 🎯 Decision tree cho file creation
- ✅ Compliance checklist

**Khi nào đọc**: 
- **TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ**
- Trước khi tạo file mới
- Trước khi tạo script
- Trước khi tạo documentation
- Khi hoàn thành task và muốn báo cáo

**Rule**: Nếu bạn là AI agent và chưa đọc file này → STOP và đọc ngay!

---

## 📚 Tài Liệu Chính

### 1. Kiến Trúc & Quy Tắc

#### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Dành cho**: Developers, AI Agents  
**Nội dung**:
- 🏗️ Giải thích chi tiết kiến trúc 7-layer
- 📊 Sơ đồ data flow
- 💡 Ví dụ code cho từng layer
- 🎯 Trách nhiệm của mỗi layer
- ✅ Best practices

**Khi nào đọc**: 
- Trước khi bắt đầu develop
- Khi thêm feature mới
- Khi không chắc code nên đặt ở đâu

---

#### [REFACTORING_RULES.md](./REFACTORING_RULES.md)
**Dành cho**: AI Agents, Developers làm refactoring  
**Nội dung**:
- 🚨 6 quy tắc vàng khi refactor
- ❌ Anti-patterns cần tránh
- ✅ Cách split code đúng
- 🔧 Checklist trước/sau refactor
- 🚑 Cách recover từ bad refactoring

**Khi nào đọc**:
- Trước khi refactor bất kì code nào
- Khi gặp lỗi "has no attribute"
- Khi cần split file lớn thành nhiều file nhỏ

---

#### [MODEL_REFERENCE.md](./MODEL_REFERENCE.md)
**Dành cho**: AI Agents, Backend Developers  
**Nội dung**:
- 📋 Danh sách CHÍNH XÁC các field của models
- ✅ Cách dùng đúng field names
- ❌ Field names bị cấm (username, full_name, etc.)
- 🔍 Commands để verify fields
- 🛠️ Common mistakes và cách fix

**Khi nào đọc**:
- Khi làm việc với User, Asset models
- Khi gặp AttributeError
- Khi không chắc field name nào đúng

---

### 2. Backend Development

#### [backend/API.md](./backend/API.md)
**Dành cho**: Backend Developers, Frontend Developers  
**Nội dung**:
- 🔌 Complete API reference
- 📡 All endpoints documentation
- 📝 Request/Response examples
- 🔐 Authentication methods
- ⚠️ Error codes

**Khi nào đọc**:
- Khi integrate với backend API
- Khi develop new endpoints
- Khi test API calls

---

#### [backend/DEVELOPMENT.md](./backend/DEVELOPMENT.md)
**Dành cho**: Backend Developers  
**Nội dung**:
- 🛠️ Development setup
- 🏃 Running the application
- 🧪 Testing workflows
- 🐛 Debugging tips
- 📦 Common development tasks

**Khi nào đọc**:
- First-time setup
- Development workflow questions
- Testing and debugging

---

#### [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)
**Dành cho**: DevOps, Backend Developers  
**Nội dung**:
- 🚀 Production deployment guide
- 🐳 Docker deployment
- 🔧 Server configuration
- 🔒 SSL/HTTPS setup
- 📊 Monitoring & maintenance

**Khi nào đọc**:
- Before production deployment
- Server configuration
- Performance optimization

---

#### [DEPLOYMENT_GUIDE_PRODUCTION.md](./DEPLOYMENT_GUIDE_PRODUCTION.md)
**Dành cho**: DevOps, System Administrators  
**Nội dung**:
- 🚀 Complete production deployment guide
- 🔧 Full stack setup (Backend + Frontend + GrapeJS)
- 🌐 VPS configuration
- 🔒 SSL/Security setup

**Khi nào đọc**:
- Complete production deployment
- Full stack setup from scratch
- Multi-service orchestration

---

### 3. User Guides

#### [SUBDOMAIN_USER_GUIDE.md](./SUBDOMAIN_USER_GUIDE.md)
**Dành cho**: End Users  
**Nội dung**: Hướng dẫn sử dụng tính năng subdomain

---

#### [SUBDOMAIN_SYSTEM_SUMMARY.md](./SUBDOMAIN_SYSTEM_SUMMARY.md)
**Dành cho**: Developers  
**Nội dung**: Technical overview của subdomain system

---

### 4. Integration & Deployment

#### [PAGEMAKER_DEPLOYMENT_PRODUCTION.md](./PAGEMAKER_DEPLOYMENT_PRODUCTION.md)
**Dành cho**: DevOps, Developers  
**Nội dung**: Production deployment guide (GrapeJS + Backend)

---

#### [PAGEMAKER_INTEGRATION.md](./PAGEMAKER_INTEGRATION.md)
**Dành cho**: Frontend Developers  
**Nội dung**: Tích hợp GrapeJS editor

---

#### [GRAPESJS_CUSTOMIZE_GUIDE.md](./GRAPESJS_CUSTOMIZE_GUIDE.md)
**Dành cho**: Frontend Developers  
**Nội dung**: Customize GrapeJS blocks

---

#### [PAGEMAKER_BUILD_GUIDE.md](./PAGEMAKER_BUILD_GUIDE.md)
**Dành cho**: Developers  
**Nội dung**: Build và compile PageMaker

---

### 5. Maintenance & Troubleshooting

#### [FIX_PAGEMAKER_PUBLISH.md](./FIX_PAGEMAKER_PUBLISH.md)
**Dành cho**: Developers  
**Nội dung**: Troubleshoot publishing issues

---

#### [PAGEMAKER_PROFESSIONAL_CHECKLIST.md](./PAGEMAKER_PROFESSIONAL_CHECKLIST.md)
**Dành cho**: QA, Developers  
**Nội dung**: Quality checklist before release

---

## 🎯 Tài Liệu Theo Vai Trò

### 🤖 AI Agents (MUST READ)
1. **[/backend/AGENTS.md](/backend/AGENTS.md)** - Đọc FIRST!
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Hiểu kiến trúc
3. **[REFACTORING_RULES.md](./REFACTORING_RULES.md)** - Trước khi refactor
4. **[MODEL_REFERENCE.md](./MODEL_REFERENCE.md)** - Khi làm với models
5. **[AI_QUICK_REF.md](./AI_QUICK_REF.md)** - Quick lookup

### 👨‍💻 Backend Developers
1. [/backend/README.md](/backend/README.md) - Setup project
2. [backend/DEVELOPMENT.md](./backend/DEVELOPMENT.md) - Development workflow
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Hiểu cấu trúc 7-layer
4. [MODEL_REFERENCE.md](./MODEL_REFERENCE.md) - Database models
5. [backend/API.md](./backend/API.md) - API documentation
6. [/backend/AGENTS.md](/backend/AGENTS.md) - Commands & patterns

### 🎨 Frontend Developers
1. [backend/API.md](./backend/API.md) - API endpoints
2. [GRAPESJS_CUSTOMIZE_GUIDE.md](./GRAPESJS_CUSTOMIZE_GUIDE.md) - Customize editor
3. [PAGEMAKER_INTEGRATION.md](./PAGEMAKER_INTEGRATION.md) - Integration guide
4. [PAGEMAKER_BUILD_GUIDE.md](./PAGEMAKER_BUILD_GUIDE.md) - Build process

### 🚀 DevOps
1. [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) - Backend deployment
2. [PAGEMAKER_DEPLOYMENT_PRODUCTION.md](./PAGEMAKER_DEPLOYMENT_PRODUCTION.md) - Full stack deployment
3. [/backend/README.md](/backend/README.md) - Environment setup
4. [/DEPLOYMENT_GUIDE_PRODUCTION.md](/DEPLOYMENT_GUIDE_PRODUCTION.md) - Production guide

### 🧪 QA/Testers
1. [PAGEMAKER_PROFESSIONAL_CHECKLIST.md](./PAGEMAKER_PROFESSIONAL_CHECKLIST.md) - Quality checklist
2. [/backend/TESTING_SUMMARY.md](/backend/TESTING_SUMMARY.md) - Testing guide
3. [FIX_PAGEMAKER_PUBLISH.md](./FIX_PAGEMAKER_PUBLISH.md) - Troubleshooting

### 👤 End Users
1. [SUBDOMAIN_USER_GUIDE.md](./SUBDOMAIN_USER_GUIDE.md) - Subdomain guide

---

## 📁 Documentation Structure

```
/docs/                          ← Global documentation (THIS FOLDER)
├── README.md                   ← This file (documentation index)
├── AI_QUICK_REF.md            ← Quick reference for AI agents
├── ARCHITECTURE.md             ← 7-layer architecture guide
├── REFACTORING_RULES.md       ← Refactoring guidelines
├── MODEL_REFERENCE.md          ← Model field reference
│
├── backend/                    ← Backend-specific docs (MERGED FROM /backend/docs/)
│   ├── API.md                  ← Complete API documentation
│   ├── DEVELOPMENT.md          ← Development setup & workflow
│   └── DEPLOYMENT.md           ← Production deployment
│
├── PAGEMAKER_*.md             ← PageMaker/GrapeJS related
├── GRAPESJS_*.md              ← GrapeJS customization
├── SUBDOMAIN_*.md             ← Subdomain system docs
└── FIX_*.md                   ← Troubleshooting guides

/backend/                       ← Backend code
├── AGENTS.md                   ← AI agents entry point
├── README.md                   ← Backend setup guide
├── ADMIN_QUICKSTART.md         ← Admin management
├── TESTING_SUMMARY.md          ← Testing guidelines
└── (no docs/ folder anymore)   ← Merged into /docs/backend/
```

---

## 🔥 Quick Start Workflows

### Workflow 1: Thêm Feature Mới
```
1. Đọc ARCHITECTURE.md → Xác định layer nào cần thay đổi
2. Check /backend/AGENTS.md → Xem file nào đã tồn tại
3. Check MODEL_REFERENCE.md → Nếu làm với models
4. Code feature theo đúng layer
5. Test ngay sau khi code xong
```

### Workflow 2: Refactor Code
```
1. Đọc REFACTORING_RULES.md → Hiểu 6 golden rules
2. Check archive/ folder → Tìm original code
3. Copy exact logic, split by layer
4. Verify với MODEL_REFERENCE.md
5. Test immediately
```

### Workflow 3: Fix Lỗi
```
1. Check terminal error → Identify error type
2. Nếu AttributeError → Check MODEL_REFERENCE.md
3. Nếu logic error → Compare với archive/
4. Nếu structure error → Check ARCHITECTURE.md
5. Fix và test
```

### Workflow 4: Deploy Production
```
1. Đọc PAGEMAKER_DEPLOYMENT_PRODUCTION.md
2. Check PAGEMAKER_PROFESSIONAL_CHECKLIST.md
3. Run tests theo TESTING_SUMMARY.md
4. Deploy theo guide
```

---

## 📊 Kiến Trúc Tổng Quan

```
PageMade Application
│
├── /backend (Flask)
│   ├── app/
│   │   ├── routes/         ← Layer 1: HTTP endpoints
│   │   ├── services/       ← Layer 2: Business logic
│   │   ├── repositories/   ← Layer 3: DB queries
│   │   ├── models/         ← Layer 4: SQLAlchemy models
│   │   ├── schemas/        ← Layer 5: Validation
│   │   ├── utils/          ← Layer 6: Helpers
│   │   └── middleware/     ← Layer 7: Interceptors
│   │
│   ├── templates/          ← Jinja2 templates
│   ├── static/             ← Static assets
│   ├── storage/            ← User uploaded files
│   ├── instance/           ← Database files
│   └── archive/            ← Original code backups
│
├── /fe (Next.js Frontend)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── /grapesjs (Page Builder)
│   └── packages/
│
└── /docs (This folder!)
    ├── README.md                  ← This file (documentation index)
    ├── AI_QUICK_REF.md           ← Quick reference
    ├── ARCHITECTURE.md            ← 7-layer architecture guide
    ├── REFACTORING_RULES.md      ← Refactoring guidelines
    ├── MODEL_REFERENCE.md         ← Model fields reference
    │
    ├── backend/                   ← Backend-specific docs
    │   ├── API.md                 ← API documentation
    │   ├── DEVELOPMENT.md         ← Development guide
    │   └── DEPLOYMENT.md          ← Deployment guide
    │
    └── (other docs)               ← PageMaker, GrapeJS, etc.
```

---

## 🆘 Troubleshooting

### ❌ Lỗi: `User has no attribute 'username'`
→ **Giải pháp**: Đọc [MODEL_REFERENCE.md](./MODEL_REFERENCE.md)  
→ Thay `username` bằng `email` (auth) hoặc `name` (display)

### ❌ Lỗi: Database queries trong routes
→ **Giải pháp**: Đọc [ARCHITECTURE.md](./ARCHITECTURE.md)  
→ Move queries vào repositories

### ❌ Không biết đặt code ở đâu
→ **Giải pháp**: Đọc [ARCHITECTURE.md](./ARCHITECTURE.md)  
→ Identify layer theo responsibility

### ❌ Refactor xong bị nhiều lỗi
→ **Giải pháp**: Đọc [REFACTORING_RULES.md](./REFACTORING_RULES.md)  
→ So sánh với archive/ files

### ❌ Publish site không hoạt động
→ **Giải pháp**: Đọc [FIX_PAGEMAKER_PUBLISH.md](./FIX_PAGEMAKER_PUBLISH.md)

---

## 📝 Contributing Guidelines

### Khi Thêm Tài Liệu Mới:
1. Thêm vào folder `/docs/`
2. Update file README.md này
3. Link từ /backend/AGENTS.md nếu cần
4. Dùng Markdown format
5. Include table of contents cho docs dài

### Khi Update Tài Liệu:
1. Maintain backwards compatibility
2. Add changelog ở cuối file
3. Update date modified
4. Notify team về changes quan trọng

---

## 🔗 External Resources

- **Flask Documentation**: https://flask.palletsprojects.com/
- **SQLAlchemy**: https://www.sqlalchemy.org/
- **GrapeJS**: https://grapesjs.com/docs/
- **Next.js**: https://nextjs.org/docs

---

## 📅 Document Versions

| Document | Last Updated | Version |
|----------|--------------|---------|
| ARCHITECTURE.md | 2025-11-17 | 1.0 |
| REFACTORING_RULES.md | 2025-11-17 | 1.0 |
| MODEL_REFERENCE.md | 2025-11-17 | 1.0 |
| This README | 2025-11-17 | 1.0 |

---

## 💬 Need Help?

1. **Check docs first** - 90% câu hỏi đã có trong docs
2. **Check /backend/archive/** - Original code reference
3. **Check terminal errors** - Error messages usually clear
4. **Ask team** - If still stuck

---

**Happy Coding! 🚀**
