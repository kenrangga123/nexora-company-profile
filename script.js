(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderIcons = () => {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons({
        attrs: {
          width: "1em",
          height: "1em",
          "aria-hidden": "true"
        }
      });
    }
  };

  renderIcons();

  const header = $("[data-header]");
  const menuButton = $("[data-menu-toggle]");
  const mobileMenu = $("[data-mobile-menu]");
  const progressBar = $(".scroll-progress span");
  const backToTop = $("[data-back-top]");
  const floatingContact = $(".floating-contact");
  const toast = $("[data-toast]");
  let toastTimer;

  const showToast = (message, type = "info") => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("is-error", type === "error");
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4600);
  };

  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    header.classList.toggle("menu-visible", open);
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    menuButton.setAttribute("data-tooltip", open ? "Close menu" : "Open menu");
    menuButton.innerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
    renderIcons();
  };

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  $$("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });

  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? scrollTop / scrollRange : 0;
    const contactSection = $("#contact");
    const contactBounds = contactSection.getBoundingClientRect();
    const contactVisible = contactBounds.top < window.innerHeight && contactBounds.bottom > 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    header.classList.toggle("is-scrolled", scrollTop > 26);
    backToTop.classList.toggle("is-visible", scrollTop > 720 && !contactVisible);
    floatingContact.classList.toggle("is-visible", scrollTop > 560 && scrollRange - scrollTop > 620 && !contactVisible);
    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  updateScrollUI();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  const revealElements = $$('[data-reveal]');
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const navLinks = $$(".desktop-nav .nav-link");
  const navTargets = $$('[data-section][id]');
  if ("IntersectionObserver" in window) {
    const activeSectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-34% 0px -54%", threshold: [0.01, 0.25, 0.5] }
    );
    navTargets.forEach((section) => activeSectionObserver.observe(section));
  }

  const hero = $(".hero");
  const heroMedia = $(".hero-media");
  const heroPulseButton = $("[data-hero-pulse]");
  let heroPaused = false;

  if (!reduceMotion) {
    hero?.addEventListener("pointermove", (event) => {
      if (heroPaused || event.pointerType === "touch") return;
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroMedia.style.transform = `scale(1.055) translate3d(${x * -8}px, ${y * -6}px, 0)`;
    });

    hero?.addEventListener("pointerleave", () => {
      heroMedia.style.transform = "";
    });
  }

  heroPulseButton?.addEventListener("click", () => {
    heroPaused = !heroPaused;
    hero.classList.toggle("is-paused", heroPaused);
    heroPulseButton.setAttribute("aria-label", heroPaused ? "Resume hero visual motion" : "Pause hero visual motion");
    heroPulseButton.querySelector("svg")?.remove();
    heroPulseButton.insertAdjacentHTML("beforeend", `<i data-lucide="${heroPaused ? "play" : "pause"}" aria-hidden="true"></i>`);
    renderIcons();
  });

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform = `rotateX(${y * -2.2}deg) rotateY(${x * 2.2}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const solutionData = {
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

  const solutionStage = $("[data-solution-stage]");
  const makeWorkflowItems = (items) =>
    items.map(([icon, text]) => `<li><i data-lucide="${icon}" aria-hidden="true"></i><span>${text}</span></li>`).join("");

  const setSolution = (key, button) => {
    const data = solutionData[key];
    if (!data || button.classList.contains("is-active")) return;
    $$("[data-solution]").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    solutionStage.classList.add("is-changing");
    window.setTimeout(() => {
      $("[data-solution-number]").textContent = data.number;
      $("[data-solution-kicker]").textContent = data.kicker;
      $("[data-solution-title]").textContent = data.title;
      $("[data-solution-description]").textContent = data.description;
      $("[data-solution-outcome]").textContent = data.outcome;
      $("[data-solution-before]").innerHTML = makeWorkflowItems(data.before);
      $("[data-solution-after]").innerHTML = makeWorkflowItems(data.after);
      renderIcons();
      solutionStage.classList.remove("is-changing");
    }, reduceMotion ? 0 : 180);
  };

  $$("[data-solution]").forEach((button) => {
    button.addEventListener("click", () => setSolution(button.dataset.solution, button));
  });

  const counterElements = $$('[data-counter]');
  const runCounter = (element) => {
    const target = Number(element.dataset.counter);
    if (reduceMotion) {
      element.textContent = String(target);
      return;
    }
    const start = performance.now();
    const duration = 760;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.7 }
    );
    counterElements.forEach((element) => counterObserver.observe(element));
  } else {
    counterElements.forEach(runCounter);
  }

  const caseStudies = {
    erp: {
      image: "/assets/case-erp-control-center.webp",
      alt: "Multi-branch ERP control center with inventory, sales, purchasing, and finance dashboards",
      eyebrow: "Retail and distribution / ERP",
      title: "Multi-branch ERP Control Center",
      summary: "A unified operational platform that gives branch teams the tools they need while management sees the business as one connected system.",
      problem: "Sales, stock, purchasing, and finance were managed in separate tools, making daily decisions slow and branch comparisons unreliable.",
      solution: "A modular ERP with a shared data model, role-based workflows, branch-level transactions, and a consolidated management control center.",
      capabilities: ["Sales and purchasing workflow", "Inventory health by branch", "Receivables and payables", "Management analytics"],
      result: "Teams work from the same operational record, while management can identify branch issues without waiting for manually assembled reports.",
      service: "ERP Development"
    },
    ai: {
      image: "/assets/case-ai-quality-inspection.webp",
      alt: "AI quality inspection system monitoring a food production line",
      eyebrow: "Food manufacturing / Computer vision",
      title: "AI Quality Inspection",
      summary: "A real-time visual inspection layer that turns production camera feeds into consistent quality signals and a usable batch history.",
      problem: "Manual checks could miss fast-moving defects, and quality trends were difficult to connect back to a specific batch or production period.",
      solution: "A computer-vision inspection interface with defect classification, live alerts, batch scoring, and a reviewable quality timeline.",
      capabilities: ["Live object detection", "Defect classification", "Batch quality scoring", "Production alerts and history"],
      result: "Quality teams can investigate issues earlier, compare batches, and maintain a clearer evidence trail for continuous improvement.",
      service: "Artificial Intelligence"
    },
    portal: {
      image: "/assets/case-customer-portal.webp",
      alt: "Responsive customer ordering portal displayed on desktop and mobile",
      eyebrow: "Food and beverage / Web platform",
      title: "Customer Ordering Portal",
      summary: "A responsive ordering experience that connects menu discovery, branch selection, loyalty, checkout, and fulfilment status.",
      problem: "The customer journey changed between channels, branch availability was unclear, and order progress required manual follow-up.",
      solution: "One responsive web platform with shared catalogue data, branch-aware availability, loyalty context, and visible order status.",
      capabilities: ["Responsive ordering flow", "Branch-aware catalogue", "Loyalty and rewards", "Order status tracking"],
      result: "Customers move through one consistent experience while branch teams receive cleaner, better-structured orders.",
      service: "Website Development"
    }
  };

  const caseDialog = $("#case-dialog");
  const populateCase = (key) => {
    const data = caseStudies[key];
    if (!data) return;
    $("[data-case-image]").src = data.image;
    $("[data-case-image]").alt = data.alt;
    $("[data-case-eyebrow]").textContent = data.eyebrow;
    $("[data-case-title]").textContent = data.title;
    $("[data-case-summary]").textContent = data.summary;
    $("[data-case-problem]").textContent = data.problem;
    $("[data-case-solution]").textContent = data.solution;
    $("[data-case-result]").textContent = data.result;
    $("[data-case-capabilities]").innerHTML = data.capabilities.map((item) => `<li>${item}</li>`).join("");
    $("[data-case-cta]").dataset.servicePick = data.service;
    caseDialog.showModal();
    document.body.classList.add("dialog-open");
    $("[data-close-case]").focus();
  };

  $$('[data-open-case]').forEach((button) => button.addEventListener("click", () => populateCase(button.dataset.openCase)));

  const closeCase = () => {
    if (caseDialog.open) caseDialog.close();
  };

  $("[data-close-case]")?.addEventListener("click", closeCase);
  caseDialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  caseDialog?.addEventListener("click", (event) => {
    const bounds = caseDialog.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) closeCase();
  });
  $("[data-case-cta]")?.addEventListener("click", (event) => {
    const value = event.currentTarget.dataset.servicePick;
    const serviceField = $("#inquiry-form")?.elements.service;
    if (value && serviceField) serviceField.value = value;
    closeCase();
  });

  $$("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      $$("[data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      $$("[data-project]").forEach((project) => {
        project.classList.toggle("is-hidden", filter !== "all" && project.dataset.category !== filter);
      });
    });
  });

  const processData = [
    {
      index: "01",
      kicker: "Business consultation",
      title: "Understand the goal before defining the system.",
      description: "We align on the business context, current pressure points, stakeholders, and the result the project should create.",
      output: "Shared objectives and discovery brief"
    },
    {
      index: "02",
      kicker: "Process analysis",
      title: "See how the work really moves today.",
      description: "We map people, data, handoffs, exceptions, approvals, and the systems already involved in the operation.",
      output: "Current-state process map and opportunity list"
    },
    {
      index: "03",
      kicker: "System planning",
      title: "Turn findings into a responsible delivery plan.",
      description: "We define scope, architecture, phases, integrations, risks, and the decisions needed before development begins.",
      output: "Solution blueprint and phased roadmap"
    },
    {
      index: "04",
      kicker: "UI and UX design",
      title: "Make complex workflows feel clear to the people using them.",
      description: "We design the information hierarchy, key journeys, interfaces, and responsive behavior around actual user roles.",
      output: "Validated flows and interface design"
    },
    {
      index: "05",
      kicker: "Development",
      title: "Build in visible, testable increments.",
      description: "The solution is developed in structured milestones with working reviews, technical checks, and clear change control.",
      output: "Working product increments and release notes"
    },
    {
      index: "06",
      kicker: "Quality assurance",
      title: "Test the system against real operating scenarios.",
      description: "We verify functionality, permissions, data integrity, responsiveness, integrations, and critical user journeys.",
      output: "Acceptance results and launch readiness"
    },
    {
      index: "07",
      kicker: "Implementation",
      title: "Launch with the people and data prepared.",
      description: "Deployment, migration, user access, training, and handover are coordinated around a practical go-live plan.",
      output: "Deployed system and trained users"
    },
    {
      index: "08",
      kicker: "Maintenance and support",
      title: "Keep the system useful as the business changes.",
      description: "We monitor, resolve issues, review improvement requests, and plan the next valuable iteration after launch.",
      output: "Support rhythm and improvement backlog"
    }
  ];

  const processDetail = $(".process-detail");
  const setProcess = (index, button) => {
    const data = processData[index];
    if (!data || button.classList.contains("is-active")) return;
    $$("[data-process]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    processDetail.classList.add("is-changing");
    window.setTimeout(() => {
      $("[data-process-index]").textContent = data.index;
      $("[data-process-kicker]").textContent = data.kicker;
      $("[data-process-title]").textContent = data.title;
      $("[data-process-description]").textContent = data.description;
      $("[data-process-output]").textContent = data.output;
      processDetail.classList.remove("is-changing");
    }, reduceMotion ? 0 : 160);
  };

  $$("[data-process]").forEach((button) => {
    button.addEventListener("click", () => setProcess(Number(button.dataset.process), button));
  });

  const bindArrowNavigation = (selector) => {
    const buttons = $$(selector);
    buttons.forEach((button, index) => {
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = buttons.length - 1;
        buttons[next].focus();
        buttons[next].click();
      });
    });
  };

  bindArrowNavigation("[data-solution]");
  bindArrowNavigation("[data-filter]");
  bindArrowNavigation("[data-process]");

  $$(".accordion-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".accordion-item");
      const panel = $(".accordion-panel", item);
      const opening = !item.classList.contains("is-open");
      $$(".accordion-item").forEach((otherItem) => {
        const otherButton = $("button", otherItem);
        const otherPanel = $(".accordion-panel", otherItem);
        otherItem.classList.remove("is-open");
        otherButton.setAttribute("aria-expanded", "false");
        otherPanel.hidden = true;
      });
      if (opening) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  const inquiryForm = $("#inquiry-form");
  const formSteps = $$("[data-form-step]");
  const formProgressLine = $("[data-form-progress-line]");
  const formProgressItems = $$("[data-progress]");
  const formSuccess = $("[data-form-success]");
  const draftKey = "nexora-inquiry-draft-v1";
  const serviceSelect = inquiryForm?.elements.service;
  const brief = inquiryForm?.elements.brief;
  const characterCount = $("[data-character-count]");
  const fileInput = $("[data-file-input]");
  const fileLabel = $("[data-file-label]");
  const consentError = $("[data-consent-error]");
  const submitButton = $("[data-submit-button]");
  let draftTimer;

  const setFormStep = (step) => {
    formSteps.forEach((element) => {
      const active = Number(element.dataset.formStep) === step;
      element.hidden = !active;
      element.classList.toggle("is-active", active);
    });
    formProgressItems.forEach((item) => item.classList.toggle("is-active", Number(item.dataset.progress) <= step));
    formProgressLine.style.transform = `scaleX(${step === 2 ? 1 : 0})`;
  };

  const fieldMessage = (input) => {
    if (input.validity.valueMissing) return "This field is required.";
    if (input.validity.typeMismatch) return "Enter a valid email address.";
    if (input.validity.tooShort) return `Use at least ${input.minLength} characters.`;
    if (input.validity.tooLong) return `Use no more than ${input.maxLength} characters.`;
    if (input.name === "whatsapp" && input.value.trim() && !/^[+0-9()\-\s]{7,24}$/.test(input.value.trim())) {
      return "Enter a valid phone or WhatsApp number.";
    }
    return "";
  };

  const validateField = (input) => {
    if (input.type === "checkbox") return input.checked;
    const field = input.closest(".field");
    if (!field) return true;
    const error = $(".field-error", field);
    const message = fieldMessage(input);
    field.classList.toggle("is-invalid", Boolean(message));
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  };

  const validateStep = (step) => {
    const inputs = $$("input, select, textarea", $(`[data-form-step="${step}"]`)).filter(
      (input) => input.name !== "attachment" && input.name !== "website" && input.type !== "checkbox"
    );
    const results = inputs.map(validateField);
    let consentValid = true;
    if (step === 2) {
      consentValid = inquiryForm.elements.consent.checked;
      consentError.textContent = consentValid ? "" : "Please confirm before sending your inquiry.";
    }
    const valid = results.every(Boolean) && consentValid;
    if (!valid) {
      const firstInvalid = inputs.find((input) => input.getAttribute("aria-invalid") === "true") || inquiryForm.elements.consent;
      firstInvalid?.focus();
    }
    return valid;
  };

  $$("input, select, textarea", inquiryForm).forEach((input) => {
    if (input.type === "file" || input.name === "website") return;
    input.addEventListener("blur", () => {
      if (input.type !== "checkbox") validateField(input);
    });
    input.addEventListener("input", () => {
      if (input.closest(".field")?.classList.contains("is-invalid")) validateField(input);
      if (input.name === "consent") consentError.textContent = "";
      window.clearTimeout(draftTimer);
      draftTimer = window.setTimeout(saveDraft, 320);
    });
    input.addEventListener("change", () => {
      window.clearTimeout(draftTimer);
      draftTimer = window.setTimeout(saveDraft, 120);
    });
  });

  $("[data-form-next]")?.addEventListener("click", () => {
    if (validateStep(1)) {
      setFormStep(2);
      $("[data-form-step='2'] select, [data-form-step='2'] textarea")?.focus();
    }
  });

  $("[data-form-back]")?.addEventListener("click", () => {
    setFormStep(1);
    inquiryForm.elements.name.focus();
  });

  brief?.addEventListener("input", () => {
    characterCount.textContent = String(brief.value.length);
  });

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) {
      fileLabel.textContent = "Attach a brief or reference";
      return;
    }
    const allowedExtensions = ["pdf", "doc", "docx"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension) || file.size > 2 * 1024 * 1024) {
      fileInput.value = "";
      fileLabel.textContent = "Attach a brief or reference";
      showToast("Please choose a PDF, DOC, or DOCX file no larger than 2 MB.", "error");
      return;
    }
    fileLabel.textContent = file.name;
  });

  function saveDraft() {
    if (!inquiryForm) return;
    const draft = {};
    new FormData(inquiryForm).forEach((value, key) => {
      if (key !== "attachment" && key !== "website" && typeof value === "string") draft[key] = value;
    });
    draft.consent = inquiryForm.elements.consent.checked;
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // Storage can be unavailable in strict privacy modes; the form still works.
    }
  }

  const restoreDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey));
      if (!draft) return;
      Object.entries(draft).forEach(([key, value]) => {
        const input = inquiryForm.elements[key];
        if (!input) return;
        if (input.type === "checkbox") input.checked = Boolean(value);
        else input.value = String(value);
      });
      characterCount.textContent = String(brief.value.length);
    } catch {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // Ignore unavailable storage and continue with the successful submission.
      }
    }
  };

  restoreDraft();

  $$('[data-service-pick]').forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.dataset.servicePick;
      if (value && serviceSelect) {
        serviceSelect.value = value;
        saveDraft();
      }
    });
  });

  const fileToPayload = (file) =>
    new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("The selected attachment could not be read."));
      reader.onload = () => {
        const result = String(reader.result);
        resolve({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data: result.includes(",") ? result.split(",")[1] : result
        });
      };
      reader.readAsDataURL(file);
    });

  inquiryForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const stepOneValid = validateStep(1);
    const stepTwoValid = validateStep(2);
    if (!stepOneValid) {
      setFormStep(1);
      validateStep(1);
      return;
    }
    if (!stepTwoValid) return;

    const originalSubmit = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    submitButton.innerHTML = '<span>Sending securely</span><i data-lucide="loader-circle" aria-hidden="true"></i>';
    renderIcons();

    try {
      const formData = new FormData(inquiryForm);
      const payload = {};
      formData.forEach((value, key) => {
        if (key !== "attachment" && typeof value === "string") payload[key] = value.trim();
      });
      payload.consent = inquiryForm.elements.consent.checked;
      payload.attachment = await fileToPayload(fileInput.files[0]);

      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Your inquiry could not be sent.");

      localStorage.removeItem(draftKey);
      inquiryForm.hidden = true;
      $(".form-progress").hidden = true;
      formSuccess.hidden = false;
      $("[data-inquiry-id]").textContent = result.id || "received";
      formSuccess.focus();
      showToast("Your inquiry has been received.");
    } catch (error) {
      saveDraft();
      showToast(`${error.message} Your draft is still saved in this browser.`, "error");
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
      submitButton.innerHTML = originalSubmit;
      renderIcons();
    }
  });

  $("[data-new-inquiry]")?.addEventListener("click", () => {
    inquiryForm.reset();
    inquiryForm.hidden = false;
    $(".form-progress").hidden = false;
    formSuccess.hidden = true;
    fileLabel.textContent = "Attach a brief or reference";
    characterCount.textContent = "0";
    setFormStep(1);
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.innerHTML = '<span>Send inquiry</span><i data-lucide="send" aria-hidden="true"></i>';
    renderIcons();
    inquiryForm.elements.name.focus();
  });

  $("[data-current-year]").textContent = String(new Date().getFullYear());
})();
