/**
 * Default Job Roles & Skill Matrices for Smart Career Assistant v1.0
 */
const defaultJobRoles = [
  {
    title: 'Software Developer',
    code: 'software-developer',
    description: 'Builds, maintains, and scales high-performance software systems and application architectures across the stack.',
    category: 'Engineering',
    requiredSkills: [
      { name: 'Data Structures & Algorithms', category: 'Core CS', minimumProficiency: 'Advanced', weight: 5, description: 'Arrays, Trees, Graphs, Sorting, Dynamic Programming' },
      { name: 'Git & Version Control', category: 'Tools', minimumProficiency: 'Intermediate', weight: 4, description: 'Branching, Merging, Rebase, PR reviews' },
      { name: 'Object-Oriented Programming (OOP)', category: 'Core CS', minimumProficiency: 'Advanced', weight: 5, description: 'Encapsulation, Polymorphism, Design Patterns' },
      { name: 'Database Management (SQL/NoSQL)', category: 'Databases', minimumProficiency: 'Intermediate', weight: 4, description: 'Schema design, Indexing, ACID transactions' },
      { name: 'RESTful API Design', category: 'Backend', minimumProficiency: 'Intermediate', weight: 4, description: 'HTTP verbs, status codes, authentication, serialization' },
      { name: 'System Design Basics', category: 'Architecture', minimumProficiency: 'Intermediate', weight: 4, description: 'Scalability, Load balancers, Caching, Microservices' },
      { name: 'Automated Testing (Unit/Integration)', category: 'Testing', minimumProficiency: 'Intermediate', weight: 3, description: 'TDD concepts, Jest, Mocha, or JUnit' },
      { name: 'Docker / Containerization', category: 'DevOps', minimumProficiency: 'Beginner', weight: 3, description: 'Dockerfiles, container lifecycle, images' },
      { name: 'Problem Solving & Debugging', category: 'Soft Skills', minimumProficiency: 'Advanced', weight: 5, description: 'Root cause analysis, profiling, logging' }
    ],
    roadmap: [
      { step: 1, title: 'Master Core Computer Science & Algorithms', duration: '4-6 weeks', topics: ['Data Structures (Trees, Graphs)', 'Algorithm Complexity (Big O)', 'LeetCode Medium practice'] },
      { step: 2, title: 'Software Engineering Best Practices & OOP', duration: '3-4 weeks', topics: ['SOLID Principles', 'Design Patterns (Factory, Strategy, Observer)', 'Clean Code'] },
      { step: 3, title: 'Database Design & API Development', duration: '4 weeks', topics: ['PostgreSQL & MongoDB', 'REST API best practices', 'JWT Authentication & Security'] },
      { step: 4, title: 'System Design, Testing & Cloud CI/CD', duration: '3-4 weeks', topics: ['Caching (Redis)', 'Docker containerization', 'Unit & Integration tests'] }
    ]
  },
  {
    title: 'Python Developer',
    code: 'python-developer',
    description: 'Develops backend services, automations, data pipelines, and APIs using modern Python ecosystems.',
    category: 'Engineering',
    requiredSkills: [
      { name: 'Python Core & Advanced', category: 'Languages', minimumProficiency: 'Advanced', weight: 5, description: 'Generators, Decorators, Concurrency, OOP, Type hinting' },
      { name: 'Django / FastAPI / Flask', category: 'Backend', minimumProficiency: 'Advanced', weight: 5, description: 'MVC/MVT, Async routes, Pydantic, ORM, Middleware' },
      { name: 'Relational Databases (PostgreSQL/MySQL)', category: 'Databases', minimumProficiency: 'Intermediate', weight: 4, description: 'SQLAlchemy, Migrations, Query optimization' },
      { name: 'REST APIs & WebSockets', category: 'Backend', minimumProficiency: 'Intermediate', weight: 4, description: 'Endpoint architecture, streaming, event handling' },
      { name: 'PyTest & TDD', category: 'Testing', minimumProficiency: 'Intermediate', weight: 3, description: 'Fixtures, Mocking, Coverage testing' },
      { name: 'Docker & Virtual Environments', category: 'DevOps', minimumProficiency: 'Intermediate', weight: 3, description: 'Poetry/Pipenv/Venv, Containerized deployment' },
      { name: 'Celery / Redis / Async Queues', category: 'Architecture', minimumProficiency: 'Intermediate', weight: 3, description: 'Background workers, Task queues, Scheduling' },
      { name: 'Git & Version Control', category: 'Tools', minimumProficiency: 'Intermediate', weight: 4, description: 'Git branching, GitHub workflows, Code reviews' }
    ],
    roadmap: [
      { step: 1, title: 'Deep Dive into Python Internals & OOP', duration: '3-4 weeks', topics: ['Dunder methods, Metaclasses', 'Generators & Asyncio', 'Clean Architecture'] },
      { step: 2, title: 'FastAPI & Django Framework Mastery', duration: '4-5 weeks', topics: ['Async endpoints with FastAPI', 'Django ORM & migrations', 'Authentication & OAuth2'] },
      { step: 3, title: 'Background Processing & Caching', duration: '3 weeks', topics: ['Celery with Redis', 'Message queues', 'Rate limiting & API security'] },
      { step: 4, title: 'Production Deployment & PyTest Testing', duration: '3 weeks', topics: ['Unit testing with PyTest', 'Dockerization', 'CI/CD with GitHub Actions'] }
    ]
  },
  {
    title: 'Data Analyst',
    code: 'data-analyst',
    description: 'Analyzes raw business data, extracts actionable insights, models trends, and builds automated executive dashboards.',
    category: 'Analytics',
    requiredSkills: [
      { name: 'SQL & Advanced Querying', category: 'Databases', minimumProficiency: 'Advanced', weight: 5, description: 'Window functions, CTEs, Joins, Aggregations, Performance' },
      { name: 'Python for Data Analysis (Pandas, NumPy)', category: 'Analytics', minimumProficiency: 'Advanced', weight: 5, description: 'Data wrangling, cleaning, transformation, exploratory analysis' },
      { name: 'Data Visualization (Tableau / Power BI / Matplotlib)', category: 'Visualization', minimumProficiency: 'Intermediate', weight: 4, description: 'Interactive dashboard creation, visual storytelling' },
      { name: 'Applied Statistics & Probability', category: 'Mathematics', minimumProficiency: 'Intermediate', weight: 4, description: 'Hypothesis testing, A/B testing, regression, distributions' },
      { name: 'Excel / Spreadsheets (Advanced)', category: 'Tools', minimumProficiency: 'Intermediate', weight: 3, description: 'VLOOKUP/XLOOKUP, Pivot tables, Power Query' },
      { name: 'Data Cleaning & ETL Concepts', category: 'Data Engineering', minimumProficiency: 'Intermediate', weight: 4, description: 'Handling nulls, duplicates, outliers, pipeline automation' },
      { name: 'Business Acumen & Communication', category: 'Soft Skills', minimumProficiency: 'Intermediate', weight: 4, description: 'Translating business questions into analytical queries' }
    ],
    roadmap: [
      { step: 1, title: 'Mastering Advanced SQL for Analysts', duration: '3-4 weeks', topics: ['Window functions (ROW_NUMBER, RANK, LEAD/LAG)', 'Complex CTEs & Aggregations', 'Database schema modeling'] },
      { step: 2, title: 'Python for Data Wrangling (Pandas & NumPy)', duration: '4 weeks', topics: ['Data cleaning workflows', 'Handling missing values & outliers', 'Data transformations & merges'] },
      { step: 3, title: 'Data Storytelling with Power BI / Tableau', duration: '3 weeks', topics: ['DAX & Calculated columns', 'Interactive KPI dashboards', 'Executive presentation design'] },
      { step: 4, title: 'Applied Business Statistics & A/B Testing', duration: '3 weeks', topics: ['Hypothesis formulation', 'P-values, confidence intervals', 'Sample sizing & decision metrics'] }
    ]
  },
  {
    title: 'Web Developer',
    code: 'web-developer',
    description: 'Designs and builds responsive, accessible, interactive web applications and full-stack web architectures.',
    category: 'Engineering',
    requiredSkills: [
      { name: 'JavaScript / TypeScript (ES6+)', category: 'Languages', minimumProficiency: 'Advanced', weight: 5, description: 'Async/await, Closures, DOM, Prototypal inheritance, Types' },
      { name: 'React.js / Next.js', category: 'Frontend', minimumProficiency: 'Advanced', weight: 5, description: 'Hooks, State management, Component lifecycle, SSR/SSG' },
      { name: 'HTML5 & Semantic Markup', category: 'Frontend', minimumProficiency: 'Advanced', weight: 4, description: 'Accessibility (a11y), SEO tags, semantic structuring' },
      { name: 'CSS3 / Tailwind CSS / Responsive Design', category: 'Frontend', minimumProficiency: 'Advanced', weight: 4, description: 'Flexbox, Grid, Media queries, animations, modern CSS' },
      { name: 'Node.js & Express.js', category: 'Backend', minimumProficiency: 'Intermediate', weight: 4, description: 'Middleware, REST endpoints, Server-side logic' },
      { name: 'Git & Version Control', category: 'Tools', minimumProficiency: 'Intermediate', weight: 4, description: 'Branch management, Merge conflict resolution, Pull requests' },
      { name: 'REST APIs & Fetch/Axios', category: 'Backend', minimumProficiency: 'Intermediate', weight: 4, description: 'API integration, Error handling, interceptors, async data' },
      { name: 'Web Performance & Security Basics', category: 'Optimization', minimumProficiency: 'Intermediate', weight: 3, description: 'Lighthouse, CORS, CSRF, XSS prevention, bundle optimization' }
    ],
    roadmap: [
      { step: 1, title: 'Modern JavaScript & TypeScript Fundamentals', duration: '3 weeks', topics: ['ES6+ features, Destructuring, Promises', 'TypeScript interfaces & generics', 'DOM Manipulation'] },
      { step: 2, title: 'Modern React & State Management', duration: '4 weeks', topics: ['Custom Hooks & Context API', 'Tailwind CSS UI systems', 'Vite & Next.js fundamentals'] },
      { step: 3, title: 'Full Stack Node & REST Integration', duration: '3-4 weeks', topics: ['Express API building', 'MongoDB/PostgreSQL integration', 'Authentication with JWT'] },
      { step: 4, title: 'Web Performance, Security & Deployment', duration: '2-3 weeks', topics: ['Web vitals & Lighthouse audits', 'CORS, XSS defense', 'Vercel/Render deployments'] }
    ]
  },
  {
    title: 'Java Developer',
    code: 'java-developer',
    description: 'Engineers enterprise-grade backends, microservices, and reliable architectures using Java and the Spring Boot ecosystem.',
    category: 'Engineering',
    requiredSkills: [
      { name: 'Core Java & Multi-threading', category: 'Languages', minimumProficiency: 'Advanced', weight: 5, description: 'Collections framework, Streams, Concurrency, JVM memory' },
      { name: 'Spring Boot & Spring Framework', category: 'Backend', minimumProficiency: 'Advanced', weight: 5, description: 'Dependency Injection, Spring MVC, Security, Actuator' },
      { name: 'Spring Data JPA / Hibernate', category: 'Databases', minimumProficiency: 'Advanced', weight: 4, description: 'Entity relationships, JPQL, Caching, Transaction management' },
      { name: 'Relational Databases & SQL', category: 'Databases', minimumProficiency: 'Intermediate', weight: 4, description: 'PostgreSQL/MySQL, Connection pooling (HikariCP), Indexing' },
      { name: 'Microservices Architecture', category: 'Architecture', minimumProficiency: 'Intermediate', weight: 4, description: 'Service discovery, API Gateway, Circuit breaker (Resilience4j)' },
      { name: 'RESTful Web Services', category: 'Backend', minimumProficiency: 'Intermediate', weight: 4, description: 'Contract-first APIs, Swagger/OpenAPI, JSON parsing' },
      { name: 'JUnit & Mockito', category: 'Testing', minimumProficiency: 'Intermediate', weight: 3, description: 'Unit testing, Mocking dependencies, Integration tests' },
      { name: 'Maven / Gradle & Git', category: 'Tools', minimumProficiency: 'Intermediate', weight: 3, description: 'Build management, Dependency resolution, Versioning' }
    ],
    roadmap: [
      { step: 1, title: 'Core Java Deep Dive & JVM Architecture', duration: '4 weeks', topics: ['Generics & Java Collections framework', 'Java Streams & Lambdas', 'Threads, Concurrency & Memory Model'] },
      { step: 2, title: 'Spring Boot & Spring Data JPA', duration: '4-5 weeks', topics: ['Spring IoC & Auto-configuration', 'Hibernate entity mappings & JPQL', 'Spring Security with JWT'] },
      { step: 3, title: 'Microservices & Enterprise Patterns', duration: '4 weeks', topics: ['Eureka Service Registry & Spring Cloud Gateway', 'Distributed tracing', 'Kafka / RabbitMQ messaging'] },
      { step: 4, title: 'Testing, Docker & Cloud Deployment', duration: '3 weeks', topics: ['JUnit 5 & Mockito test suites', 'Containerizing with Docker', 'Deploying on Cloud'] }
    ]
  }
];

module.exports = defaultJobRoles;
