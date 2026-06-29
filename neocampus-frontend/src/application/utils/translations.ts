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
    submenu_timetable: 'Agenda',

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
    submenu_timetable: 'Agenda',

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
  }
};

export type TranslationKey = keyof typeof translations['en'];
