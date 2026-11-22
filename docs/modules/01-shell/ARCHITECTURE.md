# V1 Application Shell: Architecture Document

## 1. Layout Component Hierarchy
```text
[ Root Layout ]
   ├── [ Header ]
   │      ├── Logo & Institution Title
   │      ├── Search Trigger (Desktop)
   │      ├── Status Indicator (Live API/DB)
   │      └── User Profile Dropdown
   ├── [ Body Container ] (Flex row)
   │      ├── [ Sidebar (Desktop >= 1024px) / Drawer (Mobile < 1024px) ]
   │      │      └── Navigation Registry Items
   │      └── [ Main Content Area ]
   │             ├── [ Breadcrumbs ]
   │             ├── [ Dynamic Page / Route View ]
   │             │      ├── / -> Dashboard Grid of Module Cards
   │             │      └── /<slug> -> Module View or "Coming Soon" View
   │             └── [ Toast Notification Container ]
   └── [ Footer ]
          └── Version, Status, Copyright
```

## 2. Registry Architecture (ADR-002)
- Modules are declared in `@campuscore/shared/src/registry/modules.ts`.
- The frontend shell queries the registry to build the navigation tree and dashboard cards automatically.
- When future modules are built, their status flips from `COMING_SOON` to `ACTIVE` without modifying the shell layout code.
