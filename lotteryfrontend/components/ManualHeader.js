import { useEffect } from "react"
import { useMoralis } from "react-moralis"

function ManualHeader() {
    const { enableWeb3, isWeb3Enabled, isWeb3EnableLoading, account, Moralis, deactivateWeb3 } = useMoralis()

    useEffect(()=>{
        if(!isWeb3Enabled && typeof window !== "undefined" && window.localStorage.getItem("connected")){
            enableWeb3()
        }
    },[isWeb3Enabled, enableWeb3])

    useEffect(() => {
        Moralis.onAccountChanged((newAccount) => {
            if (newAccount == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Accounted disconnected")
            } else {
                console.log(`Account changed to ${newAccount}`)
            }
        })
    }, [Moralis, deactivateWeb3])

    return (
        <nav className="p-5 border-b-2">
            <ul className="">
                <li className="flex flex-row">
                    {account ? (
                        <div className="ml-auto py-2 px-4">
                            Connected to {account.slice(0, 6)}...
                            {account.slice(account.length - 4)}
                        </div>
                    ) : (
                        <button
                            onClick={async () => { 
                                const ret = await enableWeb3()
                                if (typeof ret !== "undefined") {
                                    if (typeof window !== "undefined") {
                                        window.localStorage.setItem("connected", "injected")
                                    }
                                }
                            }}
                            disabled={isWeb3EnableLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        >
                            Connect
                        </button>
                    )}
                </li>
            </ul>
        </nav>
    )
}

export default ManualHeader