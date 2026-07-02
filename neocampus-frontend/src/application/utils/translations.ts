export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    // Navigation / Categories
    pedagogy: 'Pédagogie',
    calendar: 'Calendrier',
    analytics: 'Analytique',
    communication: 'Assistant IA',
    announce: 'Publier',
    transport: 'Transport',
    users: 'Utilisateurs',
    settings: 'Configuration',
    logout: 'Déconnexion',

    // Submenu Items
    submenu_grades: 'Notes',
    submenu_absence: 'Absence',
    submenu_library: 'Biblio',
    submenu_classes: 'Classes',
    submenu_teachers: 'Teachers',
    submenu_salaries: 'Salaries',
    submenu_timetable: 'Agenda',
    submenu_exams: 'Examens',

    // Login Card
    login_title: 'Connexion',
    login_subtitle: 'Accédez à votre espace de gestion',
    email_address: 'Adresse E-mail',
    password: 'Mot de passe',
    forgot_password: 'Mot de passe oublié ?',
    login_button: 'Se connecter',
    logging_in: 'Connexion...',
    new_to_neocampus: 'Nouveau sur NeoCampus ?',
    register_institution: 'Créer un compte établissement',

    // Shared Dashboard elements
    my_account: 'Mon Compte',
    profile: 'Profil',
    home: 'Accueil',
    filter: 'Filtrer',
    view_all: 'Voir tout',
    today: "Aujourd'hui",
    exams: 'Examens',

    // KPIs & Cards
    total_students: 'Effectif Total',
    attendance_rate: "Taux d'assiduité",
    collections_june: 'Encaissements — Juin',
    active_alerts: 'Alertes Actives',
    recent_activity: 'Activité Récente',
    distribution_by_level: 'Répartition par Niveau',
    alerts: 'Alertes',
    solve: 'TRAITER',
    view_details: 'VOIR DÉTAILS',

    // Teacher specific
    my_classes: 'Mes Classes',
    average_attendance: 'Assiduité Moyenne',
    pending_homework: 'Devoirs en attente',
    teaching_hours: 'Heures de cours / semaine',
    classes_today: 'Cours du Jour',
    statutaire_volume: 'Volume horaire statutaire',
    completed: 'TERMINÉ',
    pending: 'EN ATTENTE',

    // Finance specific
    overall_recovery: 'Recouvrement Global',
    unpaid_invoices: 'Factures Impayées',
    total_due: 'Total Échéances',
    recent_transactions: 'Transactions Récentes',
    fees_setup: 'Paramétrer frais',
    collections_record: 'Enregistrer encaissements',
    balances_reports: 'Suivre soldes & rapports',
    revenues_expenses: 'Suivre recettes & dépenses',

    // Library specific
    total_books: 'Total Ouvrages',
    active_loans: 'Emprunts Actifs',
    overdue_books: 'Ouvrages en retard',
    new_catalogued: 'Nouveautés cataloguées',
    overdue_loans: 'Emprunts en Retard',

    // Parent specific
    selected_child: 'Enfant sélectionné :',
    child_attendance: 'Assiduité Enfant',
    overall_gpa: 'Moyenne Générale',
    school_fee_balance: 'Solde Scolarité',
    academic_alerts: 'Alertes Académiques',
    latest_grades: 'Dernières Notes Reçues',
    rank: 'Rang : 3ème de la classe',

    // Student specific
    my_attendance: 'Mon Assiduité',
    my_gpa: 'Ma Moyenne',
    books_borrowed: 'Livres Empruntés',
    pending_tasks: 'Devoirs à faire',
    homework_list: 'Mes Devoirs à Rendre',
    
    // User Hub & Student Directory
    user_hub_title: 'Espace Utilisateurs',
    user_hub_subtitle: 'Sélectionnez le type d\'utilisateur pour gérer sa fiche',
    student_directory: 'Annuaire des Élèves',
    add_student: 'Nouvelle Inscription',
    edit_student: 'Modifier l\'Élève',
    search_student: 'Rechercher un élève...',
    matricule: 'Matricule',
    full_name: 'Nom Complet',
    classe: 'Classe',
    section: 'Niveau',
    status: 'Statut',
    actions: 'Actions',
    view_profile: 'Voir la Fiche',
    delete_student: 'Supprimer l\'Élève',
    delete_confirm_title: 'Confirmer la suppression',
    delete_confirm_desc: 'Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.',
    cancel: 'Annuler',
    save: 'Enregistrer',
    next: 'Suivant',
    previous: 'Précédent',
    confirm: 'Confirmer',
    personal_info: 'Infos Personnelles',
    school_info: 'Infos Scolaires',
    parent_docs: 'Parents & Documents',
  },
  en: {
    // Navigation / Categories
    pedagogy: 'Pedagogy',
    calendar: 'Calendar',
    analytics: 'Analytics',
    communication: 'AI Assistant',
    announce: 'Announce',
    transport: 'Transport',
    users: 'Users',
    settings: 'Settings',
    logout: 'Logout',

    // Submenu Items
    submenu_grades: 'Grades',
    submenu_absence: 'Absence',
    submenu_library: 'Library',
    submenu_classes: 'Classes',
    submenu_teachers: 'Teachers',
    submenu_salaries: 'Salaries',
    submenu_timetable: 'Agenda',
    submenu_exams: 'Exams',

    // Login Card
    login_title: 'Login',
    login_subtitle: 'Access your management portal',
    email_address: 'Email Address',
    password: 'Password',
    forgot_password: 'Forgot password?',
    login_button: 'Log in',
    logging_in: 'Logging in...',
    new_to_neocampus: 'New to NeoCampus?',
    register_institution: 'Register institution',

    // Shared Dashboard elements
    my_account: 'My Account',
    profile: 'Profile',
    home: 'Home',
    filter: 'Filter',
    view_all: 'View all',
    today: 'Today',
    exams: 'Exams',

    // KPIs & Cards
    total_students: 'Total Students',
    attendance_rate: 'Attendance Rate',
    collections_june: 'Collections — June',
    active_alerts: 'Active Alerts',
    recent_activity: 'Recent Activity',
    distribution_by_level: 'Distribution by Level',
    alerts: 'Alerts',
    solve: 'SOLVE',
    view_details: 'VIEW DETAILS',

    // Teacher specific
    my_classes: 'My Classes',
    average_attendance: 'Average Attendance',
    pending_homework: 'Pending Homework',
    teaching_hours: 'Teaching Hours / week',
    classes_today: 'Classes Today',
    statutaire_volume: 'Teaching Hours Limit',
    completed: 'COMPLETED',
    pending: 'PENDING',

    // Finance specific
    overall_recovery: 'Overall Recovery',
    unpaid_invoices: 'Unpaid Invoices',
    total_due: 'Total Due',
    recent_transactions: 'Recent Transactions',
    fees_setup: 'Set up fees',
    collections_record: 'Record collections',
    balances_reports: 'Balances & reports',
    revenues_expenses: 'Revenues & expenses',

    // Library specific
    total_books: 'Total Books',
    active_loans: 'Active Loans',
    overdue_books: 'Overdue Books',
    new_catalogued: 'New Catalogued',
    overdue_loans: 'Overdue Books Loans',

    // Parent specific
    selected_child: 'Selected Child :',
    child_attendance: 'Child Attendance',
    overall_gpa: 'Overall GPA',
    school_fee_balance: 'School Fee Balance',
    academic_alerts: 'Academic Alerts',
    latest_grades: 'Latest Grades',
    rank: 'Rank: 3rd in class',

    // Student specific
    my_attendance: 'My Attendance',
    my_gpa: 'My GPA',
    books_borrowed: 'Books Borrowed',
    pending_tasks: 'Pending Tasks',
    homework_list: 'Homework Task List',

    // User Hub & Student Directory
    user_hub_title: 'Users Space',
    user_hub_subtitle: 'Select the user type to manage directory profiles',
    student_directory: 'Student Directory',
    add_student: 'New Enrollment',
    edit_student: 'Edit Student',
    search_student: 'Search a student...',
    matricule: 'Matricule',
    full_name: 'Full Name',
    classe: 'Class',
    section: 'Section',
    status: 'Status',
    actions: 'Actions',
    view_profile: 'View Profile',
    delete_student: 'Delete Student',
    delete_confirm_title: 'Confirm deletion',
    delete_confirm_desc: 'Are you sure you want to delete this student? This action cannot be undone.',
    cancel: 'Cancel',
    save: 'Save',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    personal_info: 'Personal Info',
    school_info: 'School Info',
    parent_docs: 'Parents & Docs',
  }
};

export type TranslationKey = keyof typeof translations['en'];
