export const uiText = {
  openMenu: "Open navigation menu",
  closeMenu: "Close navigation menu",
  openMenuTooltip: "Open menu",
  closeMenuTooltip: "Close menu",
  previousImage: "Previous project image",
  nextImage: "Next project image",
  galleryLabel: "Project image gallery",
  viewImage: "View image {number}: {caption}",
  required: "This field is required.",
  email: "Enter a valid email address.",
  minimum: "Use at least {count} characters.",
  maximum: "Use no more than {count} characters.",
  phone: "Enter a valid phone or WhatsApp number.",
  consent: "Please confirm before sending your inquiry.",
  attachmentLabel: "Attach a brief or reference",
  attachmentInvalid: "Please choose a PDF, DOC, or DOCX file no larger than 2 MB.",
  attachmentUnreadable: "The selected attachment could not be read.",
  sending: "Sending securely",
  sendInquiry: "Send inquiry",
  inquiryFailed: "Your inquiry could not be sent.",
  reviewInquiry: "Please review the highlighted inquiry details.",
  rateLimited: "Too many inquiries were sent. Please try again later.",
  deliveryNotConfigured: "Inquiry email delivery is not configured yet.",
  invalidAttachment: "The attachment must be a valid PDF, DOC, or DOCX file no larger than 2 MB.",
  deliveryFailed: "The inquiry could not be delivered. Please contact us directly by email.",
  inquiryReceived: "Your inquiry has been received.",
  draftSaved: "Your draft is still saved in this browser.",
  received: "received"
};

export const serviceData = {
  businessSystems: {
    kicker: "Connected operations",
    title: "Run the business from one reliable operational core.",
    description: "Connect daily transactions, management visibility, and the systems that keep teams aligned.",
    offerings: ["ERP Development", "Dashboard and Analytics", "System Integration"],
    service: "ERP Development",
    cta: "Discuss your business system"
  },
  customPlatforms: {
    kicker: "Built around your workflow",
    title: "Turn a specific process into software people can use clearly.",
    description: "Create focused internal tools, customer portals, and responsive platforms without off-the-shelf constraints.",
    offerings: ["Custom Software Development", "Website Development"],
    service: "Custom Software Development",
    cta: "Explore a custom platform"
  },
  appliedAi: {
    kicker: "Practical intelligence",
    title: "Apply AI where it makes real work faster or more visible.",
    description: "Use grounded assistants, computer vision, and intelligent automation for a defined operational need.",
    offerings: ["Artificial Intelligence"],
    service: "Artificial Intelligence",
    cta: "Find an AI use case"
  }
};

export const solutionData = {
  digitalize: {
    number: "01 / 04",
    kicker: "From manual to visible",
    title: "Digitalize the work your team already does.",
    description: "Replace disconnected forms, spreadsheets, and chat approvals with one clear workflow that records every decision.",
    outcome: "A reliable digital trail from request to result.",
    before: [
      ["sheet", "Scattered spreadsheets"],
      ["messages-square", "Approval in chat"],
      ["file-clock", "Manual reporting"]
    ],
    after: [
      ["database-zap", "Structured data capture"],
      ["route", "Visible approval flow"],
      ["chart-no-axes-combined", "Live operational view"]
    ]
  },
  automate: {
    number: "02 / 04",
    kicker: "From repetitive to responsive",
    title: "Automate the handoffs that slow everyone down.",
    description: "Set rules for approvals, notifications, recurring reports, and routine data movement so the team can focus on exceptions.",
    outcome: "Less follow-up work and faster movement between teams.",
    before: [
      ["alarm-clock", "Repeated reminders"],
      ["copy", "Duplicate data entry"],
      ["user-round-check", "Manual status checks"]
    ],
    after: [
      ["bell-ring", "Triggered notifications"],
      ["refresh-cw", "Automatic synchronization"],
      ["list-checks", "Rule-based progression"]
    ]
  },
  centralize: {
    number: "03 / 04",
    kicker: "From fragmented to aligned",
    title: "Centralize the data leaders depend on.",
    description: "Bring sales, inventory, finance, customers, production, and reporting into a shared operational source of truth.",
    outcome: "One consistent picture of performance across the company.",
    before: [
      ["database", "Department data silos"],
      ["file-question", "Conflicting reports"],
      ["eye-off", "Delayed visibility"]
    ],
    after: [
      ["combine", "Connected business data"],
      ["badge-check", "Consistent definitions"],
      ["gauge", "Current management view"]
    ]
  },
  scale: {
    number: "04 / 04",
    kicker: "From one location to many",
    title: "Scale operations without losing control.",
    description: "Create repeatable branch workflows, shared standards, role-based access, and consolidated reporting as the organization grows.",
    outcome: "Local flexibility with company-wide visibility and governance.",
    before: [
      ["git-fork", "Different branch processes"],
      ["users", "Unclear access rights"],
      ["files", "Separate branch reports"]
    ],
    after: [
      ["network", "Shared operating model"],
      ["shield-check", "Role-based control"],
      ["chart-spline", "Consolidated performance"]
    ]
  }
};

export const caseStudies = {
  erp: {
    eyebrow: "Working prototype / Business systems",
    title: "Modular ERP Operations Platform",
    summary: "A broad operational prototype that connects day-to-day selling, master data, inventory, purchasing, production, customers, people, and finance in one modular workspace.",
    problem: "Growing operations need connected workflows without forcing every role into one overloaded screen or relying on disconnected spreadsheets and chat approvals.",
    solution: "A role-aware modular ERP with shared records, dedicated operational workspaces, branch context, guided purchasing stages, and management visibility.",
    capabilities: ["Point of sale and checkout", "Product and master data", "Purchasing workflow stages", "Operational dashboard and alerts"],
    result: "The prototype demonstrates how a large business system can stay structured while giving each team a focused daily interface.",
    categories: ["business-systems"],
    images: [
      {
        src: "/assets/work/erp-pos.webp",
        alt: "Modular ERP point-of-sale workspace with products, branch controls, and checkout panel",
        caption: "Point of sale with branch context, product availability, quick actions, and a focused checkout panel."
      },
      {
        src: "/assets/work/erp-master-data.webp",
        alt: "Modular ERP product master data screen with filters, status summaries, and product records",
        caption: "Master data workspace with searchable records, category and status filters, and concise data health summaries."
      },
      {
        src: "/assets/work/erp-purchasing.webp",
        alt: "Modular ERP purchasing workspace showing supplier, request, price comparison, purchase order, receipt, and invoice stages",
        caption: "Purchasing control center mapping the full flow from supplier and request through receiving, invoices, and analysis."
      }
    ],
    service: "ERP Development"
  },
  rag: {
    eyebrow: "Working prototype / Generative AI",
    title: "Private Company RAG Assistant",
    summary: "A local-first company knowledge assistant that answers internal questions from approved documents and shows the evidence behind every grounded response.",
    problem: "Company knowledge is often spread across documents and departments, while access rules and answer traceability make a generic chatbot unsuitable.",
    solution: "A private RAG workspace with permission-filtered retrieval, source citations, document ingestion, user roles, audit logs, and evaluation tools.",
    capabilities: ["Grounded answers with citations", "Permission-filtered retrieval", "Knowledge source management", "Roles, audit logs, and evaluation"],
    result: "The prototype demonstrates an assistant that can make internal knowledge easier to use without hiding where an answer came from.",
    categories: ["generative-ai"],
    images: [
      {
        src: "/assets/work/rag-grounded-answer.webp",
        alt: "Private company assistant answering a policy question with source evidence and access controls",
        caption: "Grounded chat response with inline citations and a dedicated evidence panel showing authorized sources."
      },
      {
        src: "/assets/work/rag-knowledge-sources.webp",
        alt: "Company knowledge source library with departments, access levels, versions, index status, and owners",
        caption: "Knowledge source library for reviewing document ownership, access level, version, indexing status, and retrieval chunks."
      }
    ],
    service: "Artificial Intelligence"
  },
  faceswap: {
    eyebrow: "Working prototype / Generative AI and computer vision",
    title: "Hero Booth AI Transformation",
    summary: "An event-ready photo booth journey that guides a guest from camera capture through AI character transformation to a private downloadable result.",
    problem: "An interactive booth needs to make camera readiness, transformation progress, and result delivery obvious without requiring staff to explain every step.",
    solution: "A bold three-stage interface connects a live display, guided capture, hero selection, AI processing, session reset, and private result delivery.",
    capabilities: ["Guided camera capture", "Three-stage guest journey", "AI image transformation", "Private result handoff"],
    result: "The prototype demonstrates a complete self-service experience that feels playful while keeping each operational state clear.",
    categories: ["generative-ai", "computer-vision"],
    images: [
      {
        src: "/assets/work/faceswap-capture.webp",
        alt: "Hero Booth photo capture interface with a guided three-step transformation journey",
        caption: "Capture stage with camera readiness, a clear primary action, and visible progress through the guest journey."
      },
      {
        src: "/assets/work/faceswap-complete.webp",
        alt: "Hero Booth completion screen explaining private result delivery and session reset",
        caption: "Completion state that confirms the transformation, explains result delivery, and prepares the booth for a new session."
      },
      {
        src: "/assets/work/faceswap-result.webp",
        alt: "Sanitized AI hero transformation result with the private download link removed",
        caption: "Final transformed portrait shown with a non-functional demo delivery panel for this public portfolio."
      }
    ],
    service: "Artificial Intelligence"
  },
  cctv: {
    eyebrow: "Working prototype / Computer vision",
    title: "Motion-Triggered CCTV Dashboard",
    summary: "A computer-vision control room that combines live camera detection, motion-triggered recording, session diagnostics, and an accessible clip history.",
    problem: "Continuous camera footage is difficult to review, while operators need immediate confidence that detection and recording are working correctly.",
    solution: "A YOLO-based dashboard monitors the live stream, exposes motion and device health, records event clips automatically, and keeps recordings organized.",
    capabilities: ["Live YOLO detection", "Motion-triggered recording", "Session and device health", "Searchable recording history"],
    result: "The prototype demonstrates how live visual events can become structured, reviewable evidence instead of an unmanageable continuous feed.",
    categories: ["computer-vision"],
    images: [
      {
        src: "/assets/work/cctv-motion-dashboard.webp",
        alt: "Motion capture dashboard with anonymized live detection, system health, and saved recordings",
        caption: "Anonymized control room showing live detection state, recording health, performance signals, and saved motion clips."
      }
    ],
    service: "Artificial Intelligence"
  }
};

export const processData = [
  {
    index: "01",
    kicker: "Consultation and analysis",
    title: "Understand the operation before defining the system.",
    description: "We align on the goal, then map the people, data, handoffs, exceptions, and systems involved today.",
    output: "Discovery brief and current-state map"
  },
  {
    index: "02",
    kicker: "Planning and design",
    title: "Define a responsible plan and a clear user experience.",
    description: "We shape scope, architecture, phases, integrations, key journeys, and interfaces around actual user roles.",
    output: "Solution blueprint and validated interface flows"
  },
  {
    index: "03",
    kicker: "Development and quality assurance",
    title: "Build in visible increments and test real operating scenarios.",
    description: "Working milestones are reviewed and verified for functionality, permissions, data integrity, integrations, and responsiveness.",
    output: "Tested product increments and launch readiness"
  },
  {
    index: "04",
    kicker: "Launch and continuous improvement",
    title: "Go live with prepared users, then keep improving.",
    description: "We coordinate deployment, access, training, and handover, then maintain a clear rhythm for support and valuable iterations.",
    output: "Deployed system, trained users, and improvement backlog"
  }
];
