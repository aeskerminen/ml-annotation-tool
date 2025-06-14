import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../../store";
import { update, updateLabel, remove } from "../../slices/rectangleSlice";
import type { Rectangle } from "../annotator/types/Rectangle";

export const AnnotationEditor = () => {
    const rectangles = useSelector((state: RootState) => state.rectangles.value);
    const attributes = useSelector((state: RootState) => state.attributes.value);
    const dispatch = useDispatch();
    const [selectedRect, setSelectedRect] = useState<string | null>(null);

    const handleUpdateRect = (id: string, changes: Partial<Rectangle>) => {
        dispatch(update({ id, changes }));
    };

    const handleLabelChange = (id: string, newLabel: string) => {
        dispatch(updateLabel({ id, label: newLabel }));
    };

    const handleDelete = (id: string) => {
        dispatch(remove(id));
        if (selectedRect === id) {
            setSelectedRect(null);
        }
    };

    return (
        <aside className="flex-1 bg-white shadow-lg flex flex-col h-full border-[#1976d2] overflow-hidden">
            <header className="bg-[#1976d2] text-white px-6 py-4 flex items-center gap-3 border-b-2 border-[#1565c0]">
                <span className="text-xl font-bold tracking-wide">Annotations</span>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                    {rectangles.length} items
                </span>
            </header>
            <section className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                {rectangles.length === 0 ? (
                    <span className="text-[#1976d2] font-mono opacity-70">No annotations created yet.</span>
                ) : (
                    rectangles.map((rect) => (
                        <div
                            key={rect.id}
                            className={`border rounded-lg overflow-hidden ${selectedRect === rect.id ? 'border-[#1976d2] bg-[#e3f2fd]' : 'border-gray-200'
                                }`}
                        >
                            <div
                                className="p-4 cursor-pointer hover:bg-[#f5faff] transition"
                                onClick={() => setSelectedRect(selectedRect === rect.id ? null : rect.id)}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono font-bold text-[#1976d2]">
                                        {rect.label}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(rect.id);
                                        }}
                                        className="px-2 py-0.5 text-xs font-bold text-white bg-[#b22222] hover:bg-[#ff6347] rounded transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600 font-mono">
                                    ID: {rect.id.slice(0, 8)}...
                                </div>
                            </div>
                            {selectedRect === rect.id && (
                                <div className="bg-white p-4 border-t border-gray-100">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                            <select
                                                value={rect.label}
                                                onChange={(e) => handleLabelChange(rect.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent"
                                            >
                                                {attributes.map((attr) => (
                                                    <option key={attr} value={attr}>
                                                        {attr}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(rect.x)}
                                                    onChange={(e) => handleUpdateRect(rect.id, { x: Number(e.target.value) })}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(rect.y)}
                                                    onChange={(e) => handleUpdateRect(rect.id, { y: Number(e.target.value) })}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(rect.width)}
                                                    onChange={(e) => handleUpdateRect(rect.id, { width: Math.max(5, Number(e.target.value)) })}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(rect.height)}
                                                    onChange={(e) => handleUpdateRect(rect.id, { height: Math.max(5, Number(e.target.value)) })}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rotation (degrees)</label>
                                            <input
                                                type="number"
                                                value={Math.round(rect.rotation)}
                                                onChange={(e) => handleUpdateRect(rect.id, { rotation: Number(e.target.value) })}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div className="mt-4 text-xs text-[#888] font-mono leading-relaxed bg-[#f5faff] border border-[#e3f2fd] p-3 rounded">
                    <span className="font-bold text-[#1976d2]">Tip:</span> Click on an annotation to edit its properties. You can fine-tune the position, size, and rotation of each rectangle, or change its label.
                </div>
            </section>
        </aside>
    );
};

export default AnnotationEditor;