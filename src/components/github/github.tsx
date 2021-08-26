import React, { ChangeEvent, createRef } from "react";
import { useState } from "react";
import { gitservice, useLocalStorage } from "../../App";
import ConfirmDelete from "../ConfirmDelete";

interface importerProps { }

export const GitHubImporter: React.FC<importerProps> = () => {
    const [url, setUrl] = useLocalStorage(
        "GITHUB_URL",
        'https://github.com/bunsenstraat/empty'
    );
    const [branch, setBranch] = useLocalStorage(
        "GITHUB_BRANCH",
        'main'
    );
    const [token, setToken] = useLocalStorage(
        "GITHUB_TOKEN",
        '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'
    );
    const [force, setForce] = useLocalStorage(
        "GITHUB_FORCE",
        true
    );

    const [name, setName] = useLocalStorage(
        "GITHUB_NAME",
        'REMIX'
    );

    const [email, setEmail] = useLocalStorage(
        "GITHUB_EMAIL",
        'youremail@dummy.com'
    );


    let ModalRef = createRef<ConfirmDelete>();

    const clone = async () => {
        try {
            await ModalRef.current?.show();
            gitservice.clone(url, branch, token)
        } catch (e) {

        }
    }

    const push = async () => {
        gitservice.push(url, branch, token, force, name, email)
    }

    const pull = async () => {
        gitservice.pull(url, branch, token, name, email)
    }

    const fetch = async () => {
        gitservice.fetch(url, branch, token, name, email)
    }

    const onUrlChange = (value: string) => {
        setUrl(value)
    }
    const onBranchChange = (value: string) => {
        setBranch(value)
    }
    const onTokenChange = (value: string) => {
        setToken(value)
    }
    const onForceChange = (event: any) => {
        const target = event.target;
        const value = target.checked;
        setForce(value)
    }
    const onNameChange = (value: string) => {
        setName(value)
    }
    const onEmailChange = (value: string) => {
        setEmail(value)
    }

    return (
        <>
            <ConfirmDelete
                title={"Cloning"}
                text={"This will create a new workspace! Your repo might be to big and crash the browser! Continue?"}
                ref={ModalRef}
            ></ConfirmDelete>
            <div className="form-group">
                <h4>GITHUB</h4>
                <label>URL</label>
                <input onChange={e => onUrlChange(e.target.value)} value={url} className="form-control" type="text" id="ipfs" />
                <label>REMOTE BRANCH</label>
                <input onChange={e => onBranchChange(e.target.value)} value={branch} className="form-control" type="text" id="ipfs" />
                <label>PERSONAL GITHUB TOKEN</label>
                <input onChange={e => onTokenChange(e.target.value)} value={token} className="form-control" autoComplete="off" type="password" id="ipfs" />

                <label>NAME</label>
                <input onChange={e => onNameChange(e.target.value)} value={name} className="form-control" type="text" id="ipfs" />
                <label>EMAIL</label>
                <input onChange={e => onEmailChange(e.target.value)} value={email} className="form-control" type="text" id="ipfs" />
                <label>FORCE PUSH</label>
                <input className='ml-2' checked={force} onChange={e => onForceChange(e)} value={token} type="checkbox" id="ipfs" />
            </div>
            <button className='btn btn-primary m-2' onClick={async () => {
                clone()
            }}>clone</button>
            <button className='btn btn-primary m-2' onClick={async () => {
                push()
            }}>push</button>
            <button className='btn btn-primary m-2' onClick={async () => {
                pull()
            }}>pull</button>
            <button className='btn btn-primary m-2' onClick={async () => {
                fetch()
            }}>fetch</button>
            <hr></hr>
            <div>
                To use this you need to get a personal access token on GitHub and add REPO permissions.<br></br>
                <a href='https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token' target='_blank'>More info on personal access tokens...</a>
            </div>

        </>
    );
};
