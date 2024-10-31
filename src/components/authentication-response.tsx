/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { BasicUserInfo } from "@asgardeo/auth-react";
import React, { FunctionComponent, ReactElement, useState } from "react";
import { default as authConfig } from "../config.json";
import { JsonViewer } from '@textea/json-viewer'

/**
 * Decoded ID Token Response component Prop types interface.
 */
interface AuthenticationResponsePropsInterface {
    /**
     * Derived Authenticated Response.
     */
    derivedResponse?: any;
}

export interface DerivedAuthenticationResponseInterface {
    /**
     * Response from the `getBasicUserInfo()` function from the SDK context.
     */
    authenticateResponse: BasicUserInfo;
    /**
     * ID token split by `.`.
     */
    idToken: string[];
    /**
     * Decoded Header of the ID Token.
     */
    decodedIdTokenHeader: Record<string, unknown>;
    /**
     * Decoded Payload of the ID Token.
     */
    decodedIDTokenPayload: Record<string, unknown>;
}

/**
 * Displays the derived Authentication Response from the SDK.
 *
 * @param {AuthenticationResponsePropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const AuthenticationResponse: FunctionComponent<AuthenticationResponsePropsInterface> = (
    props: AuthenticationResponsePropsInterface
): ReactElement => {

    const {
        derivedResponse
    } = props;

    const [userInfo, setUserInfo] = useState<any>(derivedResponse?.authenticateResponse);
    const [idToken, setIdToken] = useState<string[]>(derivedResponse?.idToken);
    const [decodedIdTokenHeader, setDecodedIdTokenHeader] = useState<any>(derivedResponse?.decodedIdTokenHeader);
    const [decodedIDTokenPayload, setDecodedIdTokenPayload] = useState<any>(derivedResponse?.decodedIDTokenPayload);

    const handleOrgSwitchRequest = async () => {
        try {
            const formBody = new URLSearchParams({
                token: derivedResponse?.accessToken || '',
                scope: authConfig?.scope.join(' '),
                client_id: authConfig?.clientID,
                switching_organization: authConfig?.orgId,
                grant_type: 'organization_switch'
            });
            const res = await fetch(authConfig?.baseUrl + '/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody.toString()
            });

            const data = await res.json();
            if (data.id_token) {
                setIdToken(data.id_token.split('.'));
                setDecodedIdTokenHeader(JSON.parse(atob(data.id_token.split('.')[0])));
                setDecodedIdTokenPayload(decodeJwt(data.id_token));
            } else {
                console.log('ID Token not found in response.');
            }

            if (data.access_token) {
                fetchUserInfo(data.access_token);
            } else {
                console.error('Access Token not found in response.');
            }
        } catch (error) {
            console.error('Error while switching:', error);
        }
    };

    const decodeJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    const fetchUserInfo = async (accessToken: string) => {
        try {
            const response = await fetch(authConfig?.baseUrl + '/oauth2/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });

            if (!response.ok) {
                console.error(`Error while retrieving user info: ${response.status}`);
            }

            const data = await response.json();
            setUserInfo(data);
        } catch (error) {
            console.error('Failed to fetch user info:', error);
        }
    };


    if (decodedIDTokenPayload?.org_id !== authConfig?.orgId) {
        handleOrgSwitchRequest();
    }

    return (
        <>
            <h2>Authentication Response</h2>
            <h4 className="sub-title">
                Derived by the&nbsp;
                <code className="inline-code-block">
                    <a href="https://www.npmjs.com/package/@asgardeo/auth-react/v/latest"
                        target="_blank"
                        rel="noreferrer"
                    >
                        @asgardeo/auth-react
                    </a>
                </code>&nbsp;SDK
            </h4>
            <div className="json">
                <JsonViewer
                    className="asg-json-viewer"
                    value={userInfo}
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    rootName={false}
                    theme="dark"
                />
            </div>
            <h2 className="mb-0 mt-4">ID token</h2>
            <div className="row">
                {idToken && (
                    <div className="column">
                        <h5>
                            <b>Encoded</b>
                        </h5>
                        <div className="code">
                            {idToken?.length === 3 ? (
                                <code>
                                    <span className="id-token-0">{idToken[0]}</span>.
                                    <span className="id-token-1">{idToken[1]}</span>.
                                    <span className="id-token-2">{idToken[2]}</span>
                                </code>
                            ) : (
                                <div>ID token not found</div>
                            )}
                        </div>
                    </div>
                )}
                <div className="column">
                    <div className="json">
                        <h5>
                            <b>Decoded:</b> Header
                        </h5>
                        <JsonViewer
                            className="asg-json-viewer"
                            value={decodedIdTokenHeader}
                            enableClipboard={false}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            rootName={false}
                            theme="dark"
                        />
                    </div>

                    <div className="json">
                        <h5>
                            <b>Decoded:</b> Payload
                        </h5>
                        <JsonViewer
                            className="asg-json-viewer"
                            value={decodedIDTokenPayload}
                            enableClipboard={false}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            rootName={false}
                            theme="dark"
                        />
                    </div>
                    <div className="json">
                        <h5>Signature</h5>
                        <div className="code">
                            <code>
                                HMACSHA256(
                                <br />
                                &nbsp;&nbsp;<span className="id-token-0">base64UrlEncode(
                                    <span className="id-token-1">header</span>)</span> + "." + <br />
                                &nbsp;&nbsp;<span className="id-token-0">base64UrlEncode(
                                    <span className="id-token-1">payload</span>)</span>,&nbsp;
                                <span className="id-token-1">your-256-bit-secret</span> <br />
                                );
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
