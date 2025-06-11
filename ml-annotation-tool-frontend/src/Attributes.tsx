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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAttributeInput(e.target.value);
    };

    return (
        <div className="flex-1 text-center bg-gray-600 flex flex-col p-4">
            <p className="flex-0 text-center p-1 bg-black">Attributes</p>
            <div className="flex-0 p-2 bg-gray-400 flex flex-row justify-between gap-2">
                <input
                    className="p-2 flex-1"
                    type="text"
                    id="attribute-input"
                    placeholder="Attribute..."
                    onChange={handleInputChange}
                    value={attributeInput}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddAttribute(); }}
                    autoComplete="off"
                />
                <button onClick={handleAddAttribute} disabled={!attributeInput.trim()}>
                    Add attribute
                </button>
            </div>
            <div className="bg-white p-2 flex-1 flex flex-col gap-2">
                {attributes.length === 0 ? (
                    <p className="text-gray-500">No attributes yet.</p>
                ) : (
                    attributes.map((attr: string, i: number) => (
                        <p key={attr + i} className="bg-black p-2 text-medium text-white">{attr}</p>
                    ))
                )}
            </div>
        </div>
    );
}

export default Attributes