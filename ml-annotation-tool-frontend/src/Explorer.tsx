import { FaFolderOpen } from 'react-icons/fa';

const mockProjects = [
    {
        name: 'VOC Dataset 2025',
        description: 'Main VOC XML annotation project',
        updated: '2025-06-10',
    },
    {
        name: 'Wildlife Images',
        description: 'Animal detection dataset',
        updated: '2025-05-28',
    },
    {
        name: 'Urban Scenes',
        description: 'City street annotation',
        updated: '2025-04-15',
    },
];

const Explorer = () => {
    return (
        <aside className="flex-1 bg-white shadow-lg flex flex-col h-full overflow-hidden">
            <header className="bg-[#1976d2] text-white px-6 py-4 flex items-center gap-3 border-b-2 border-[#1565c0]">
                <span className="text-xl font-bold tracking-wide">Explorer</span>
            </header>
            <section className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-2">
                    {mockProjects.length === 0 ? (
                        <span className="text-[#1976d2] font-mono opacity-70">No projects found.</span>
                    ) : (
                        mockProjects.map((project) => (
                            <button
                                key={project.name}
                                className="flex items-center gap-3 px-4 py-3 bg-[#f5faff] border border-[#e3f2fd] hover:border-[#1976d2] hover:bg-[#e3f2fd] transition rounded text-left shadow-sm group w-full"
                            >
                                <span className="text-[#1976d2]">
                                    <FaFolderOpen size={22} />
                                </span>
                                <span className="flex flex-col flex-1 min-w-0">
                                    <span className="font-bold text-[#1976d2] truncate">{project.name}</span>
                                    <span className="text-xs text-[#555] truncate">{project.description}</span>
                                </span>
                                <span className="text-xs text-[#888] font-mono ml-2 whitespace-nowrap">{project.updated}</span>
                            </button>
                        ))
                    )}
                </div>
                <div className="mt-4 text-xs text-[#888] font-mono leading-relaxed bg-[#f5faff] border border-[#e3f2fd] p-3 rounded">
                    <span className="font-bold text-[#1976d2]">Tip:</span> Select a project to start annotating images. Projects help organize your datasets and annotation tasks.
                </div>
            </section>
        </aside>
    );
};

export default Explorer;