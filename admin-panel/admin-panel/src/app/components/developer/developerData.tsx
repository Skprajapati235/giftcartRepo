// src/data/developerData.tsx
export interface Stat {
    value: string;
    label: string;
}

export interface Project {
    id: number;
    icon: string;
    title: string;
    description: string;
    tech: string[];
    link: string;
    linkText: string;
}

export interface Experience {
    year: string;
    title: string;
    description: string;
}

export interface Testimonial {
    quote: string;
    author: string;
    designation: string;
}

export interface Contact {
    email: string;
    github: string;
    linkedin: string;
    twitter: string;
}

export interface DeveloperData {
    name: string;
    tagline: string;
    role: string;
    bio: string;
    stats: Stat[];
    profileImage: string;
    skills: string[];
    projects: Project[];
    experience: Experience[];
    testimonial: Testimonial;
    contact: Contact;
}

export const developerData: DeveloperData = {
    name: "Sonu Kumar Prajapati",
    tagline: "crafting scalable web apps",
    role: "full‑stack engineer · open for opportunities",
    bio: "I'm Sonu Kumar Prajapati — full‑stack developer with 2+ years of experience in building high-performance web applications. From elegant frontends to robust backend systems, I deliver end-to-end solutions.",

    stats: [
        { value: "10+", label: "projects shipped" },
        { value: "10+", label: "clients worldwide" },
        { value: "100%", label: "delivery rate" }
    ],

    profileImage: "/images/gallery5.jpg",

    skills: [
        "TypeScript", "React / Next.js", "React Native", "Node.js", "Git", "GitHub", "Python", "GraphQL",
        "Tailwind CSS", "Pandas", "MongoDB", "Docker", "Matplotlib",
        "Numpy", "Seaborn","Visual Studio Code", "Jupyter Notebook", "Antigravity", "Curasor AI"
    ],

    projects: [
        {
            id: 1,
            icon: "chart-line",
            title: "FlowDash Analytics",
            description: "Interactive dashboard with real-time data streaming, custom reporting engine, and RBAC. Serves 500+ daily users.",
            tech: ["React", "D3.js", "Node", "Socket.io"],
            link: "#",
            linkText: "Live demo →"
        },
        {
            id: 2,
            icon: "store",
            title: "MarketHub E‑commerce",
            description: "End-to-end marketplace solution with payment gateway, search microservice, and admin dashboard.",
            tech: ["Next.js", "Stripe", "Prisma", "Redis"],
            link: "#",
            linkText: "Case study →"
        },
        {
            id: 3,
            icon: "robot",
            title: "TaskFlow AI",
            description: "Smart task automation platform using LLM integration. Auto-labels and generates subtasks from natural language.",
            tech: ["FastAPI", "React", "OpenAI", "MongoDB"],
            link: "#",
            linkText: "API docs →"
        }
    ],

    experience: [
        {
            year: "2022 — present",
            title: "Senior Full‑Stack Engineer · Nexify Labs",
            description: "Lead frontend architecture and backend microservices. Migrated monolith to Next.js + Node, improving performance by 40%."
        },
        {
            year: "2019 — 2022",
            title: "Software Developer · StellarSoft",
            description: "Built RESTful APIs and interactive dashboards using React & Django. Integrated third-party payment gateways."
        },
        {
            year: "2017 — 2019",
            title: "Frontend Developer (Freelance)",
            description: "Delivered 15+ responsive web apps for startups. Specialized in modern React and performance optimization."
        },
        {
            year: "🎓 2017",
            title: "B.Tech in Computer Science · AKTU University",
            description: "Graduated with honors, focus on full‑stack development & cloud computing."
        }
    ],

    testimonial: {
        quote: "Sonu brings deep technical expertise and a product-first mindset. One of the most reliable full‑stack devs I've worked with.",
        author: "Priya Mehta",
        designation: "CTO @ Nexify Labs"
    },

    contact: {
        email: "sonu@devstack.in",
        github: "https://github.com/sonukprajapati",
        linkedin: "https://linkedin.com/in/sonukprajapati",
        twitter: "https://twitter.com/sonukprajapati"
    }
};

export function getDeveloperInfo() {
    return developerData;
}

export function getProjectById(id: number) {
    return developerData.projects.find(project => project.id === id);
}

export function getSkills() {
    return developerData.skills;
}