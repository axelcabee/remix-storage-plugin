import { PluginClient } from "@remixproject/plugin"
import { useEffect, useState } from "react"
import { Alert } from "react-bootstrap"

interface SettingsProps {
    client: PluginClient
    showOk: boolean
}

export const GitHubSettings: React.FC<SettingsProps> = (props) => {
    const [token, setToken] = useState<boolean>(false)
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')
    const [hide, setHide] = useState<boolean>(false)

    const hideWarning = () => {
        setHide(true)
    }

    const getToken = async () => {
        let tokenConfig = await props.client.call('config' as any, 'getAppParameter', 'settings/gist-access-token')
        if (tokenConfig) {
            setToken(true)
        } else {
            setToken(false)
        }
        let userNameConfig = await props.client.call('config' as any, 'getAppParameter', 'settings/github-user-name')
        if (userNameConfig) {
            setUserName(userNameConfig)
        } else {
            setUserName('')
        }
        let userEmailConfig = await props.client.call('config' as any, 'getAppParameter', 'settings/github-email')
        if (userEmailConfig) {
            setUserEmail(userEmailConfig)
        } else {
            setUserEmail('')
        }
    }
    useEffect(() => {



        const fetchData = async () => {
            if (props.client && props.client.isLoaded) {
                await getToken()
            } else {
                props.client.onload().then(async () => {
                    await getToken()
                })
            }
        }
        fetchData()
            .catch(console.error);
    }, [])


    const settings = () => {
        return <>        {!token ? (
            <Alert variant='info'>Provide a "personal github access token" to access private repositories and have push/pull rights.<br></br>
                Please update these settings in the REMIX settings.<br></br>
                <button className="btn btn-sm btm-primary" onClick={async () => { await getToken() }}>check settings</button>
                {!props.showOk && <button className="btn btn-sm btm-primary" onClick={hideWarning}>hide this warning</button>}
            </Alert>

        ) : (props.showOk ? <Alert variant="success">GitHub token is setup!</Alert> : '')}
            {(!userName || !userEmail) ? (
                <Alert variant='info'>GitHub name & email are also required to push & pull.
                    <br></br>
                    Please update these settings in the REMIX settings.<br></br>
                    <button className="btn btn-sm btm-primary" onClick={async () => { await getToken() }}>check settings</button>
                    {!props.showOk && <button className="btn btn-sm btm-primary" onClick={hideWarning}>hide this warning</button>}
                </Alert>
            ) : (props.showOk ? <Alert variant="success">GitHub user and email are setup!</Alert> : '')}</>
    }
    return (
        <>
            {!props.showOk && hide === true ? '' : settings()}
        </>)
}