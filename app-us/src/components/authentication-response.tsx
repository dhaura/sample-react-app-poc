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
import React, { FunctionComponent, ReactElement } from "react";
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

    const customJsonViewerTheme = {
        base00: '#272822', // Background
        base01: '#3e3d32', // Slightly lighter shade for collapsible elements
        base02: '#4d4d4d', // Even lighter shade, if needed
        base03: '#ffffff', // Key text color
        base04: '#ffffff', // General text color for plain text
        base05: '#ffffff', // Default color for JSON punctuation (braces, brackets)
        base06: '#d0d0d0', // Slightly muted white for subtle details
        base07: '#ffffff', // Primary color for string values
        base08: '#8659f8', // Color for booleans and nulls
        base09: '#8659f8', // Numbers color
        base0A: '#8659f8', // Color for strings
        base0B: '#8659f8', // Arrays and additional data types
        base0C: '#6393c6', // Special values, if needed
        base0D: '#ffffff', // Default key color
        base0E: '#8659f8', // Functions or similar callable types
        base0F: '#558eb1', // Error messages or unique values, like hex or special types
    };

    return (
        <>
            <h2>Authenticaticated User Info</h2>
            <div className="json">
                <JsonViewer
                    className="asg-json-viewer"
                    value={derivedResponse?.authenticateResponse}
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    rootName={false}
                    theme={customJsonViewerTheme}
                />
            </div>
            <h2 className="mb-0 mt-4">ID token</h2>
            <div className="row">
                {derivedResponse?.idToken && (
                    <div className="column">
                        <h5>
                            <b>Encoded</b>
                        </h5>
                        <div className="code">
                            {derivedResponse?.idToken?.length === 3 ? (
                                <code>
                                    <span className="id-token-0">{derivedResponse?.idToken[0]}</span>.
                                    <span className="id-token-1">{derivedResponse?.idToken[1]}</span>.
                                    <span className="id-token-2">{derivedResponse?.idToken[2]}</span>
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
                            value={derivedResponse?.decodedIdTokenHeader}
                            enableClipboard={false}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            rootName={false}
                            theme={customJsonViewerTheme}
                        />
                    </div>

                    <div className="json">
                        <h5>
                            <b>Decoded:</b> Payload
                        </h5>
                        <JsonViewer
                            className="asg-json-viewer"
                            value={derivedResponse?.decodedIDTokenPayload}
                            enableClipboard={false}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            rootName={false}
                            theme={customJsonViewerTheme}
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
