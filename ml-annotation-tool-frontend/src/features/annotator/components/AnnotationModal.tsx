// Modal for adding annotation
export const AnnotationModal = ({
    show, attributes, selectedAttribute, setSelectedAttribute, onAdd, onClose,
}: {
    show: boolean;
    attributes: string[];
    selectedAttribute: string;
    setSelectedAttribute: (val: string) => void;
    onAdd: () => void;
    onClose: () => void;
}) => {
    if (!show) return null;
    return (
        <div className="absolute p-2 bg-black flex flex-col justify-center" style={{ zIndex: 999 }}>
            <select value={selectedAttribute} onChange={e => setSelectedAttribute(e.target.value)}>
                <option value="" disabled>Select attribute</option>
                {attributes.map((a: string) => (
                    <option key={a} value={a}>{a}</option>
                ))}
            </select>
            <button onClick={onAdd}>Add</button>
            <button onClick={onClose} className="mt-2">Cancel</button>
        </div>
    );
};
