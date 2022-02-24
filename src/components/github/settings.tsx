import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createRef, useEffect } from "react";

import { Alert, Card } from "react-bootstrap";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";

import { gitservice, useLocalStorage } from "../../App";
import ConfirmDelete from "../ConfirmDelete";
import { useBehaviorSubject } from "../usesubscribe";

interface importerProps { }

export const GitHubSettings: React.FC<importerProps> = () => {
    const [token, setToken] = useLocalStorage(
        "GITHUB_TOKEN",
        ''
    );
    const [name, setName] = useLocalStorage(
        "GITHUB_NAME",
        ''
    );

    const [email, setEmail] = useLocalStorage(
        "GITHUB_EMAIL",
        ''
    );
    const onTokenChange = (value: string) => {
        setToken(value)
    }
    const onNameChange = (value: string) => {
        setName(value)
        gitservice.githubname = value;
    }
    const onEmailChange = (value: string) => {
        setEmail(value)
    }

    useEffect(() => 
    {
        gitservice.token = token;
    },[token])

    useEffect(() => 
    {
        gitservice.githubemail = email;
    },[email])

    useEffect(() => 
    {
        gitservice.githubname = name;
    },[name])

    return (
        <>
        
        {token ? <></> :
                <Alert variant='warning'>Missing GitHub personal token. Provide a token to access private repositories and have push/pull rights.<br></br>
                    <a href='https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token' target='_blank'>More info on personal access tokens...</a>
                </Alert>}
            {name ? <></> :
                <Alert variant='warning'>GitHub name & email is required to push & pull.</Alert>
            }
        <h4>CONFIG</h4><label>PERSONAL GITHUB TOKEN</label><input name='token' readOnly onFocus={e => e.target.readOnly = false} onBlur={e => e.target.readOnly = true} onChange={e => onTokenChange(e.target.value)} value={token} className="form-control" autoComplete="off" type="password" id="token" /><CopyToClipboard
            text={token}
            onCopy={() => {
                toast.success("Copied to clipboard.");
            } }
        >
            <button className="mt-2 btn btn-primary mb-2 btn-sm">Copy token to clipboard</button>
        </CopyToClipboard><div className='row'>
                <div className='col col-md-6 col-12'>
                    <label>NAME</label>
                    <input name='name' onChange={e => onNameChange(e.target.value)} value={name} className="form-control" type="text" id="githubname" />
                </div>
                <div className='col col-md-6 col-12'>
                    <label>EMAIL</label>
                    <input name='email' onChange={e => onEmailChange(e.target.value)} value={email} className="form-control" type="text" id="githubemail" />
                </div>
            </div><hr></hr></>
    )
    }