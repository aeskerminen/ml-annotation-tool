import { useState } from "react"

const Attributes = () => {
    const [attributeList, setAttributeList] = useState<Array<string>>([]);

    const [attributeInput, setAttributeInput] = useState<string>();

    return (
        <div className='flex-1 text-center bg-gray-600 flex flex-col p-4'>
            <p className="flex-0 text-center p-1 bg-black">Attributes</p>
            <div className="flex-0 p-2 bg-gray-400 flex flex-row justify-between gap-2">
                <input className="p-2 flex-1" type="text" id="attribute-input" placeholder="Atrribute..." onInput={(e) => setAttributeInput(e.target.value)} value={attributeInput}></input>
                <button onClick={() => {
                    setAttributeList(prev => [...prev, attributeInput])
                    setAttributeInput("");
                }}>Add attribute</button>
            </div>
            <div className="bg-white p-2 flex-1 flex flex-col gap-2">
                {attributeList.map((e, i) => {
                    return <p key={i} className="bg-black p-2 text-medium">{e}</p>
                })}
            </div>
        </div>
    )
}

export default Attributes