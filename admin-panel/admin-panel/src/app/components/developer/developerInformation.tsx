import React from "react";
import { developerData } from "./developerData";

export default function DeveloperInformation() {
    const data = developerData;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
            {/* --- Navigation --- */}
            <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                        {data.name.split(' ')[0].toUpperCase()} /&gt;
                    </div>

                    <ul className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
                        <li><a href="#work" className="hover:text-blue-600 transition-colors">Projects</a></li>
                        <li><a href="#skills" className="hover:text-blue-600 transition-colors">Stack</a></li>
                        <li><a href="#experience" className="hover:text-blue-600 transition-colors">Journey</a></li>
                    </ul>

                    <a href="#contact" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200 active:scale-95">
                        Connect
                    </a>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            {data.role}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                            Building digital <span className="text-blue-600">experiences</span> that matter.
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-xl mb-10">
                            {data.bio}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a href="#work" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-xl shadow-blue-100">
                                View Projects
                                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </a>
                            <div className="flex -space-x-3 items-center ml-4">
                                {data.stats.slice(0, 3).map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold shadow-sm">
                                        🚀
                                    </div>
                                ))}
                                <span className="pl-6 text-sm font-medium text-slate-500">Trusted by global clients</span>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="relative mx-auto w-full max-w-[400px] aspect-square rounded-[2rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl border-[12px] border-white">
                            <img
                                src={data.profileImage}
                                alt={data.name}
                                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-700"
                            // onError={(e) => { e.target.src = "https://via.placeholder.com/400x400"; }}
                            />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                            <div className="text-2xl font-black text-blue-600 leading-none">{data.stats[0].value}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{data.stats[0].label}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Stats Row --- */}
            <section className="max-w-7xl mx-auto px-6 mb-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Skills (Marquee style or Grid) --- */}
            <section id="skills" className="py-24 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">The Stack</h2>
                    <h3 className="text-3xl md:text-4xl font-bold mb-12">Expertise & Tools</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {data.skills.map((skill) => (
                            <div key={skill} className="px-6 py-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-semibold hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all cursor-default">
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Projects Section --- */}
            <section id="work" className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Portfolio</h2>
                            <h3 className="text-4xl font-bold">Featured Work</h3>
                        </div>
                        <a href={data.contact.github} className="hidden md:block text-slate-500 font-semibold hover:text-blue-600 transition">View GitHub ↗</a>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.projects.map((project) => (
                            <div key={project.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                    <i className={`fas fa-${project.icon} text-2xl text-blue-600 group-hover:text-white`}></i>
                                </div>
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {project.tech.map((t) => (
                                        <span key={t} className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-wider">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <a href={project.link} className="inline-flex items-center gap-2 font-bold text-sm text-slate-900 group-hover:gap-4 transition-all">
                                    Case Study <i className="fas fa-arrow-right text-blue-500"></i>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Experience --- */}
            <section id="experience" className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-16 text-center">My Career Journey</h2>
                    <div className="space-y-12">
                        {data.experience.map((exp, idx) => (
                            <div key={idx} className="relative pl-8 md:pl-0 md:grid md:grid-cols-5 gap-8">
                                <div className="hidden md:block text-right pt-1 font-bold text-blue-600 italic">
                                    {exp.year}
                                </div>
                                <div className="md:col-span-4 relative border-l-2 border-slate-200 pl-8 pb-4">
                                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-white border-4 border-blue-600"></div>
                                    <div className="md:hidden font-bold text-blue-600 mb-1">{exp.year}</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{exp.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Contact Footer --- */}
            <footer id="contact" className="px-6 pb-12">
                <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-8 md:p-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Let's build the future together.</h2>
                            <p className="text-slate-400 text-lg mb-8">Currently open for new opportunities and collaborations.</p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <a href={`mailto:${data.contact.email}`} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all">
                                    Send an Email
                                </a>
                                <div className="flex gap-4 items-center">
                                    <a href={data.contact.linkedin} className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-all">
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                    <a href={data.contact.github} className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-all">
                                        <i className="fab fa-github"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem]">
                                <div className="text-blue-400 font-mono text-sm mb-4">Contact.json</div>
                                <div className="space-y-2 font-mono text-slate-300 text-sm">
                                    <p><span className="text-purple-400">"status":</span> <span className="text-green-400">"Available"</span>,</p>
                                    <p><span className="text-purple-400">"location":</span> <span className="text-green-400">"Remote / Global"</span>,</p>
                                    <p><span className="text-purple-400">"timezone":</span> <span className="text-green-400">"GMT +5:30"</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-12 text-slate-400 text-sm font-medium">
                    © {new Date().getFullYear()} — Built by {data.name} with React & Tailwind
                </div>
            </footer>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
}