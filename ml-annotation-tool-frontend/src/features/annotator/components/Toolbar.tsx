import { MdAddBox, MdOutlineFileDownload, MdOutlineUpload } from 'react-icons/md';

// Toolbar component for annotation actions
export const Toolbar = ({ onAdd, onExport, onUpload }: { onAdd: () => void; onExport: () => void; onUpload: () => void; }) => (
    <div className="absolute flex flex-row gap-4 top-6 z-50 bg-white/90 backdrop-blur-sm border-2 border-[#1976d2] shadow-lg p-2 rounded-lg items-center">
        <button
            onClick={onAdd}
            className="bg-white text-white p-2 font-bold border border-[#1976d2] hover:bg-[#1565c0] transition rounded-lg focus:outline-none group relative"
            title="Add Annotation"
        >
            <MdAddBox size={24} />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Add Annotation
            </span>
        </button>
        <button
            onClick={onExport}
            className="bg-white text-white p-2 font-bold border border-[#1976d2] hover:bg-[#1565c0] transition rounded-lg focus:outline-none group relative"
            title="Export to VOC XML"
        >
            <MdOutlineFileDownload size={24} />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Export to VOC XML
            </span>
        </button>
        <button
            onClick={onUpload}
            className="bg-white text-white p-2 font-bold border border-[#1976d2] hover:bg-[#1565c0] transition rounded-lg focus:outline-none group relative"
            title="Export to VOC XML"
        >
            <MdOutlineUpload size={24} />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Open new image
            </span>
        </button>
    </div>
);
