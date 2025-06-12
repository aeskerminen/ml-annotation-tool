import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "./store";
import { add, remove } from "./attributeSlice"

const Attributes = () => {
    const attributes = useSelector((state: RootState) => state.attributes.value);
    const dispatch = useDispatch();
    const [attributeInput, setAttributeInput] = useState<string>("");

    const handleAddAttribute = () => {
        const trimmed = attributeInput.trim();
        if (trimmed) {
            dispatch(add(trimmed));
            setAttributeInput("");
        }
    };

    const handleRemoveAttribute = (attr: string) => {
        dispatch(remove(attr));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAttributeInput(e.target.value);
    };

    return (
        <aside className="flex-1 bg-white shadow-lg flex flex-col h-full border-[#1976d2] overflow-hidden">
            <header className="bg-[#1976d2] text-white px-6 py-4 flex items-center gap-3 border-b-2 border-[#1565c0]">
                <span className="text-xl font-bold tracking-wide">Attributes</span>
            </header>
            <section className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex gap-2">
                    <input
                        className="flex-1 border border-[#1976d2] bg-[#f5faff] text-[#222] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] font-mono tracking-wide rounded min-w-0"
                        type="text"
                        id="attribute-input"
                        placeholder="Add attribute"
                        onChange={handleInputChange}
                        value={attributeInput}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddAttribute(); }}
                        autoComplete="off"
                    />
                    <button
                        onClick={handleAddAttribute}
                        disabled={!attributeInput.trim()}
                        className="bg-[#1976d2] text-white px-5 py-2 font-bold border border-[#1976d2] hover:bg-[#1565c0] transition disabled:opacity-50 disabled:cursor-not-allowed rounded"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 overflow-y-auto max-h-56">
                    {attributes.length === 0 ? (
                        <span className="text-[#1976d2] font-mono opacity-70">No attributes defined yet.</span>
                    ) : (
                        attributes.map((attr: string) => (
                            <span
                                key={attr}
                                className="bg-[#e3f2fd] text-[#1976d2] border border-[#1976d2] px-4 py-1 flex items-center gap-2 text-sm font-mono tracking-wide uppercase shadow-sm font-bold rounded-full max-w-full overflow-hidden text-ellipsis"
                                style={{ maxWidth: '100%' }}
                            >
                                <span className="truncate">{attr}</span>
                                <button
                                    type="button"
                                    aria-label={`Remove ${attr}`}
                                    className="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-[#b22222] hover:bg-[#ff6347] border border-[#b22222] rounded transition focus:outline-none"
                                    onClick={() => handleRemoveAttribute(attr)}
                                    style={{ minWidth: '1.5rem', minHeight: '1.5rem', lineHeight: 1 }}
                                >
                                    X
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <div className="mt-4 text-xs text-[#888] font-mono leading-relaxed bg-[#f5faff] border border-[#e3f2fd] p-3 rounded">
                    <span className="font-bold text-[#1976d2]">Tip:</span> Attributes define the object classes for your dataset. These will be used as &lt;name&gt; tags in VOC XML annotations. Add all relevant classes before annotating images.
                </div>
            </section>
        </aside>
    );
}

export default Attributes