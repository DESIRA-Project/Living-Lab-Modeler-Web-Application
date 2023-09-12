export const environment = {
  production: true,
  env: {
    client:{
      prefix:"/llm/"
    },
    backend: {
      protocol: "https",
      host: "",
      port: "",
      recaptcha_key: "",
      use_analytics: false,
      use_recaptcha: true,
      use_goauth: true,
      backend_prefix:"llmbe/",
      get_auth_providers: "llmbe/auth/getSupportedAuthProviders",
      gooath: "llmbe/auth/googlesignin",
      get_user_profile: "llmbe/authuseractions/getUserProfile",
      request_user_profile: "llmbe/authuseractions/requestUserProfile",
      request_update_user_profile: "llmbe/authuseractions/requestUpdateUserProfile",
      update_user_profile: "llmbe/authuseractions/updateUserProfile",
      get_users: "llmbe/authuseractions/getUsers",
      get_domains: "llmbe/domains/getDomains",
      request_user_activation: "llmbe/authuseractions/requestUserActivation",
      get_scp_entities_based_on_criteria: "llmbe/scpentities/getUniqueSCPEntitiesBasedOnCriteria",
      get_scp_entities_based_on_name:"llmbe/scpentities/getSCPEntityLabelsBasedOnName",
      switch_entity_moderation:"llmbe/scpentities/switchEntityModeration",
      delete_scp_entities: "llmbe/scpentities/deleteSCPEntities",
      verify_scp_entities: "llmbe/scpentities/verifySCPEntities",
      check_scp_entity_exists:"llmbe/scpentities/checkSCPEntityExists",
      create_scp_entity_label:"llmbe/scpentities/createSCPEntityLabel",
      update_scp_entity_label:"llmbe/scpentities/updateSCPEntityLabel",
      get_scp_groups: "llmbe/scpgroups/getSCPGroups",
      search_city:"llmbe/location/searchCity",
      search_country:"llmbe/location/searchCountry",
      get_user_defined_stakeholders: "llmbe/stakeholders/getUserDefinedStakeholders",
      add_user_defined_stakeholder: "llmbe/stakeholders/addUserDefinedStakeholder",
      get_stakeholders:"llmbe/stakeholders/get",
      get_moderated_stakeholders:"llmbe/stakeholders/getModeratedStakeholders",
      get_stakeholder_roles:"llmbe/stakeholders/getStakeholderRoles",
      create_living_lab : "createLivingLab",
      download_living_lab_report:"report",
      download_living_lab_material:"downloadMaterial",
      digital_technologies: "llmbe/digital-technologies",
      digital_technology_add: "add",
      digital_technology_has_entities_connected:"hasEntitiesConnected",
      sdg_has_entities_connected:"hasEntitiesConnected",
      assets: "llmbe/assets",
      sdgs: "llmbe/sdgs",
      stakeholders: "llmbe/stakeholders",
      living_lab: "llmbe/living-lab",
      assets_download: "llmbe/assets/download",
      living_lab_activity: "activity",
      activity_types: "llmbe/activity-types",
      timezones: "llmbe/timezones",
      activity_formats: "llmbe/activity-formats",
      languages: "llmbe/languages",
      location: "llmbe/location",
      location_search_postfix: "search",
      user_living_labs_postfix: "user",
      public_living_labs_postfix: "public",
      user_ll_permissions_postfix: "user-ll-permissions",
      ll_user_membership_postfix: "llmbe/ll-user-membership",
      get_ll_users: "getLLUsers",
      get_ll_user_roles: "getLLUserRoles",
      get_ll_potential_members: "getLLPotentialMembers",
      get_ll_default_role: "getLLDefaultRole",
      get_ll_minimal_required_roles:"getLLMinimalRequiredRoles",
      save_ll_membership:"saveLLMembership",
      delete_ll:"deleteLivingLab",
      update_ll: "updateLivingLab",
      assets_original_filename_postfix: "originalFilename",
      check_if_stakeholder_name_exists: "checkIfNameExists",
      remove_ll_user_membership_postfix: "remove",
      get_all_published_living_labs:"all_published",
      get_all_living_labs:"get_all_living_labs",
      get_all_living_labs_for_management:"getAllLivingLabsForManagement",
      activate_living_lab:"activateLivingLab",
      deactivate_living_lab:"deactivateLivingLab",
      delete_living_lab_permanently:"deleteLivingLabPermanently",
      ll_join_request: {
        url: "llmbe/ll-join-request",
        add: {
          url: "add"
        },
        get_num_of_pending_requests: {
          url: "get-num-of-pending-requests"
        },
        get_pending_requests: {
          url: "get-pending-requests"
        },
        accept: {
          url: "accept"
        },
        reject: {
          url: "reject"
        }
      },
      living_lab_exists : "livingLabExists",
      check_user_living_lab_membership : "checkUserLivingLabMembership",
      can_modify_living_lab : "canModifyLivingLab",
      check_user_has_already_requested_join : "checkUserHasAlreadyRequestedJoin",
      get_mini_summary : "getMiniSummary",
      contact:"llmbe/contact",
      contact_submit:"submit",
      outcome_tags: "llmbe/outcome-tags",
      asset_resource_types: "llmbe/asset-resource-types",
      socio_economic_impact: {
        url: "llmbe/seimpact",
        get_se_impact: {
          url: "getSEImpact"
        }
      }
    },
    goauth: {
      async: true,
      src: "https://apis.google.com/js/api.js",
      defer: true,
      img: "assets/btn_google_signin_light_normal_web.png",
      img_width:191,
      img_height:46,
      client_id:''
    },
    oaoauth: {
      async: true,
      src: "https://apis.google.com/js/api.js",
      defer: true,
      img: "assets/openaire.png",
      img_width:100,
      img_height:70,
      login_url:"",
      redirect_url:"",
      client_id:"",
      scope:"openid profile email",
      response_type:"code",
      disable:false,
  },
    ga: {
      global_site_tag: [
        {
          code: "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());        gtag('config', '');"
        },
        {
          async: true,
          src: "https://www.googletagmanager.com/gtag/js?id="
        }
      ],
      header: "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','');",
      body: "<iframe src=\"https://www.googletagmanager.com/ns.html?id=\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>"
    },

    "user-management":{
      "cookie-key":"llm-auth"
  },
  user_landing_page: {
    views: [
        { name: "userHomePage", desc: "Home", scope: "General", url: "/home", breadcrumb_label: "Home", permissions: ["create_living_lab"],icon:"home",uses_recaptcha:false },
        { name: "editUserProfile", desc: "My Profile", scope: "General", url: "/my-profile", breadcrumb_label: "My Profile", permissions: ["edit_profile"],icon:"person",uses_recaptcha:false },
        { name: "livingLabCreation", desc: "Organize a Living Lab", scope: "General", url: "/living-lab-creation", breadcrumb_label: "Living Lab Creation", permissions: ["create_living_lab"],icon:"add",uses_recaptcha:true },
        { name: "livingLabUpdate", desc: "Update a Living Lab", scope: "General", url: "/living-lab-update", breadcrumb_label: "My Living Labs", permissions: ["create_living_lab"],icon:"",uses_recaptcha:true, hidden: true
          ,breadcrumb_path: [{ name: "Living Lab Modeler", key: "home"}, {name: 'My Living Labs', key: 'myLivingLabs'}, {name: 'Update', key: ''}]
        },
        { name: "userLivingLabManagement", desc: "My Living Labs", scope: "General", url: "/my-living-labs", breadcrumb_label: "My Living Labs", permissions: ["view_my_living_labs"],icon:"list",uses_recaptcha:false },
        { name: "allLivingLabs", desc: "All Living Labs", scope: "General", url: "/all-living-labs", breadcrumb_label: "All Living Labs", permissions: ["view_my_living_labs"],icon:"public",uses_recaptcha:false },
        { name: "userManual", desc: "User Manual", scope: "General", url: "https://drive.google.com/file/d/1ag95Zp3Itxy0c9vwB0XB5lcAyP3x9RiA/view", openInNewTab: true, breadcrumb_label: "", permissions: ["view_my_living_labs"],icon:"help",uses_recaptcha:false },
        //{ name: "publicLivingLabs", desc: "Public Living Labs", scope: "General", url: "/public-living-labs", breadcrumb_label: "Public Living Labs", permissions: ["view_my_living_labs"],icon:"public",uses_recaptcha:false },
        /*{ name: "userAnalytics", desc: "Analytics", scope: "General", url: "/analytics", breadcrumb_label: "Analytics", permissions: ["view_user_analytics","view_all_analytics"],icon:"analytics",uses_recaptcha:false },*/
        { name: "usersManagement", desc: "Users Management", scope: "ADMINISTRATION", url: "/users-management", breadcrumb_label: "Users Management", breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Administration", key: "" }, { name: "Users Management", key: "" }], permissions: ["view_all_users", "edit_all_users"],icon:"manage_accounts",uses_recaptcha:false },
        /*{ name: "livingLabManagement", desc: "Living Lab Management", scope: "ADMINISTRATION", url: "/living-lab-management", breadcrumb_label: "Moderate Suggestions", breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Administration", key: "" }, { name: "Living Lab Management", key: "" }], permissions: ["view_living_labs", "edit_living_labs","update_living_labs","remove_living_labs","insert_living_labs"],icon:"space_dashboard",uses_recaptcha:false },*/
        /*{ name: "contentManagement", desc: "Content Management", scope: "CONTENT MANAGEMENT", url: "/content-management", breadcrumb_label: "Content Management", breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Administration", key: "" }, { name: "Content Management", key: "" }], permissions: ["view_living_labs","edit_living_lab_content"],icon:"fa-thin fa-cube",uses_recaptcha:true }*/

        { name: "livingLabManagement", desc: "Living Labs", scope: "CONTENT MANAGEMENT", url: "/living-lab-management", breadcrumb_label: "Living Lab Management",breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Content Management", key: "" }, { name: "Living Lab Management", key: "" }], permissions: ["view_living_labs", "edit_living_labs", "remove_living_labs", "update_living_labs"],icon:"window",uses_recaptcha:false },
        { name: "digitalTechnologyManagement", desc: "Digital Technologies", scope: "CONTENT MANAGEMENT", url: "/digital-technology-management", breadcrumb_label: "Digital Technology Management",breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Content Management", key: "" }, { name: "Digital Technology Management", key: "" }], permissions: ["view_digital_technologies", "edit_digital_technologies", "delete_digital_technologies"],icon:"memory",uses_recaptcha:false },
        { name: "livingLabEntityManagement", desc: "Living Lab Entities", scope: "CONTENT MANAGEMENT", url: "/living-lab-entity-management", breadcrumb_label: "Living Lab Entity Management", permissions: ["view_scp_entities", "edit_scp_entities"],icon:"category",breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Content Management", key: "" }, { name: "Living Lab Entity Management", key: "" }],uses_recaptcha:false },
        { name: "sdgManagement", desc: "SDGs", scope: "CONTENT MANAGEMENT", url: "/sdg-management", breadcrumb_label: "SDG Management", permissions: ["view_sdgs", "edit_sdgs", "delete_sdgs"],icon:"assistant",breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Content Management", key: "" }, { name: "SDG Management", key: "" }],uses_recaptcha:false },
        { name: "stakeholderManagement", desc: "Stakeholders", scope: "CONTENT MANAGEMENT", url: "/stakeholder-management", breadcrumb_label: "Stakeholder Management", permissions: ["view_stakeholders", "edit_stakeholders"],icon:"groups",breadcrumb_path: [{ name: "Living Lab Modeler", key: "home" }, { name: "Content Management", key: "" }, { name: "Stakeholder Management", key: "" }],uses_recaptcha:false },
    ]
},
breadcrumb: {
    items: {
        home: {
            name: "Living Lab Modeler",
            link: "/llm"
        },
        privacy: {
            name: "Privacy Policy",
            link: "#/llm/privacy"
        },
        about: {
            name: "About",
            link: "#/llm/about"
        },
        "terms-of-use": {
            name: "Terms of Service",
            link: "#/llm/terms-of-use"
        },
        contact: {
            name: "Contact Us",
            link: "#/llm/contact"
        },
        ll:{
            name:"Living Lab",
            link:""
        },
        activity:{
            name:"Activity",
            link:""
        },
        signin: {
            name: "Sign In",
            link: "/llm/signin"
        },
        profile: {
            name: "My Profile",
            link: "/llm/profile"
        },
        user: {
            name: "User",
            link: ""
        },
    },
    paths: {
        privacy: ["home"],
        about: ["home"],
        home:["home"],
        "terms-of-use": ["home"],
        contact: ["home"],
        signin: ["home"],
        profile: ["home"],
        ll:["home"],
        activity:["home"]
    }
},
llCreation:{
    menuButtons:[
    {id:"generalInfo",icon:"assets/generalInfo.png",tooltip:"Some general information about your Living Lab",componentName:"llGeneralInfo",name:"General*",matIcon:"info"},
    // {id:"location",icon:"assets/location.png",tooltip:"The Living Lab's location",componentName:"llLocation",name:"Location*",matIcon:"home"},
    {id:"domain",icon:"assets/domain.png",tooltip:"The domains of your Living Lab",componentName:"llDomains",name:"Domain",matIcon:"dns"},
    {id:"stakeholders",icon:"assets/stakeholder.png",tooltip:"The Living Lab's stakeholders",componentName:"llStakeholders",name:"Stakeholders",matIcon:"groups"},
    {id:"dts",icon:"assets/dt.png",tooltip:"The digital technologies adapted by your Living Lab",componentName:"llDTs",name:"Digital Technologies",matIcon:"biotech"},
    {id:"sdgs",icon:"assets/sdgs.jpg",tooltip:"The SDGs that are assigned to your Living Lab",componentName:"llSDGs",name:"SDGs*",matIcon:"flag"},
    {id:"scpentities",icon:"assets/sdgs.jpg",tooltip:"The SCP Entities that participate in your Living Lab",componentName:"llSCPEntities",name:"SCP System",matIcon:"category"},
    {id: "activities", icon: "", tooltip: "The activities that are being run by your Living Lab", componentName: "llActivities", name: "Activities", matIcon: "event_note"},
    {id: "outcomes", icon: "", tooltip: "The outcomes of your Living Lab", componentName: "llOutcomes", name: "Outcomes", matIcon: "view_stream"}
 //   {id:"members",icon:"assets/members.png",tooltip:"The SCP Entities that participate in your Living Lab",componentName:"llSCPEntities",name:"SCP System",matIcon:"category},

]
},
llLocation:{
    htmlLabel:"leaflet-map",
    pinMap:{
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
    },
    mapCentering:{
        lat: 38.01131226070673, lng: 23.27590942382813
    },
    optionsText: {
        0: "Use GPS",
        1: "Select City",
        2: "Select Country",
        3: "Describe Location"
    }
},
navbar: {
    logo: "assets/empty.png",
    colors: {
        title: "#007628"
    },
    llm: {
        link: "/llm"
    },
    items: [
        {
            name: "Sign In",
            link: "/signin",
            group:2,
            showOnlyOnUnauthenticatedUser: false,
            authenticated: {
                name: "Sign Out",
            }
        },
        {
            authenticated: {
                name: "Profile",
                link: "/llm/my-profile",
            }
        }
    ]
},
footer: {
    eu: {
        file: "assets/europe.jpg",
        w: 50,
        h: 40,
        link: ""
    },
    desira: {
        file: "assets/Logo Desira_1.png",
        w: 120,
        h: 50,
        link: "https://desira2020.eu/"
    },
    athena: {
        file: "assets/athena_cropped.png",
        w: 160,
        h: 40,
        link: "https://www.imsi.athenarc.gr/en"
    },
    text: {
        funding: "This work is funded by the European Commission under the Horizon 2020 European research infrastructures grant agreement no. 818194",
        privacy: { "text": "Privacy Policy", "link": "#/llm/privacy" },
        "terms-of-use":{"text":"Terms of Service","link":"#/llm/terms-of-use"},
        about: { "text": "About", "link": "#/llm/about" },
        contact: { "text": "Contact Us", "link": "#/llm/contact" },
        cookies: "Manage Cookies"
    },
    font: {
        size: "0.7em"
    }
},
"dynamic-modal": {
    logo: {
        file: "assets/empty.png"
    },
    recaptchaLogo:{
        file:"assets/recaptcha.png",
        width:60,
        height:40
    }
},
"cookie-banner": {
    cookie_object_name: "llm",
    notice_text: "This website uses cookies for analytics, improving your on-line experience and enabling third party features. If you agree, choose \"Accept all\", otherwise manage your preferences in \"Cookie settings\".",
    cookie_modal: {
        logo: {
            file: "assets/empty.png",
            w: 150,
            h: 45
        },
        title: "How Living Lab Modeler uses cookies",
        content: ["Cookies are small pieces of data that are stored by a browser on a computer's hard drive, mobile phone or any other device used to access the internet. Living Lab Modeler uses cookies that are absolutely necessary for the operation of the website.", "In addition, with your consent Living Lab Modeler may collect analytical/ performance Cookies. These cookies allow to count the number of visitors and to improve website experience. They collect aggregated information (i.e. country, browser type, time and duration of website visit, etc.). With respect to analytical/ performance Cookies, Living Lab Modeler uses Google Analytics (Google Ireland Limited) that enable it to optimize website experience based on the specific user characteristics. For more information on the terms of personal data processing please review <a href='https://policies.google.com/privacy'>Google’s privacy policy</a>.", "You may change your cookie settings at any time to accept or refuse these analytics technologies.", "This page uses cookies to improve website experience. With your consent, we may collect cookies for statistical purposes. For more information see our privacy statement available <a href='/kbt/privacy'>here.</a>"],
        cookie_settings: {
            cookie_categories: [
                {
                    name: "Strictly necessary / Basic Cookies",
                    description: "Strictly necessary cookies are essential for the running of the website; they are also essential for you to browse the website and use its features. ",
                    always_enabled: true,
                    details: {},
                    code: "sess",
                    default_value: true,
                    plugin: "session"
                },
                {
                    name: "Analytical/Performance Cookies.",
                    description: "These cookies allow us to count the number of visitors and to improve website experience. These cookies collect aggregated information (i.e. country, browser type, time and duration of website visit, etc.) ",
                    always_enabled: false,
                    details: {},
                    code: "ga",
                    default_value: false,
                    plugin: "ga"
                }
            ]
        }
    }
},
  signIn:{
      redirectionLink:"/home",
      link:"/signin"
  },
    livingLabViewPage: {
      scpSystem: {
        scpGraph: {
          colors: {
            Socio: '#a51c38',
            Physical: '#548655',
            Cyber: '#5280bc'
          }
        }
      },
      socioEconomicImpact: {
        graph: {
          arcColors: {
            "Economic": "blue",
            "Environment": "red",
            "Governance": "green",
            "Social": "orange"
          },
          "inactiveArcColor": "gray"
        }
      }
    },
    ll_default_photo_square: "assets/ll_default_image_square.png",
    ll_default_photo_landscape: "assets/ll_default_image_landscape.png",
    activity_default_photo: "assets/activity_default_image.png"
  }
};
