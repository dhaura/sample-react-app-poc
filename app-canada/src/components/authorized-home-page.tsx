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

import React, { FunctionComponent, ReactElement, useState, useEffect } from "react";
import { default as authConfig } from "../config.json";
import { FiUser, FiHome } from "react-icons/fi"; // Profile icon
import { IoExitOutline } from "react-icons/io5";
import WA_CA_LOGO from "../images/wa-ca-logo.png";
import FIN_APP from "../images/financial-app.jpg";
import { AuthenticationResponse } from "../components";


/**
 * Decoded ID Token Response component Prop types interface.
 */
interface AuthorizedHomePagePropsInterface {
    /**
     * Derived Authenticated Response.
     */
    derivedResponse?: any;
    signOut?: any;
}

/**
 * Displays the derived authorized home page.
 *
 * @param {AuthenticationResponsePropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const AuthorizedHomePage: FunctionComponent<AuthorizedHomePagePropsInterface> = (
    props: AuthorizedHomePagePropsInterface
): ReactElement => {

    const {
        derivedResponse,
        signOut
    } = props;

    const [userInfo, setUserInfo] = useState<any>(derivedResponse?.authenticateResponse);
    const [idToken, setIdToken] = useState<string[]>(derivedResponse?.idToken);
    const [decodedIdTokenHeader, setDecodedIdTokenHeader] = useState<any>(derivedResponse?.decodedIdTokenHeader);
    const [decodedIDTokenPayload, setDecodedIdTokenPayload] = useState<any>(derivedResponse?.decodedIDTokenPayload);
    const [isUserAuthorized, setIsUserAuthorized] = useState<boolean>(false);

    const handleOrgSwitchRequest = async (accessToken: string) => {
        try {
            const formBody = new URLSearchParams({
                token: accessToken,
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

            if (res.status === 401) {
                console.log(`Error while switching: ${res.status}`);
                setIsUserAuthorized(false);
                return;
            }
            setIsUserAuthorized(true);

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


    useEffect(() => {

        if (decodedIDTokenPayload?.org_id !== authConfig?.orgId) {
            const accessToken = derivedResponse?.accessToken; 
            if (accessToken) {
                handleOrgSwitchRequest(accessToken);
            }
        }
    }, [decodedIDTokenPayload?.org_id, derivedResponse?.accessToken]);

    const handleLogout = () => {
        signOut();
    };

    const [isProfileView, setIsProfileView] = useState(false);

    const handleProfileClick = () => {
        setIsProfileView(!isProfileView); // Toggle between profile and home view
    };

    const getDerivedAuthenticationState = () => {
        return {
            authenticateResponse: userInfo,
            idToken: idToken,
            decodedIdTokenHeader: decodedIdTokenHeader,
            decodedIDTokenPayload: decodedIDTokenPayload
        };
    }

    const getUsername = (user: any) => {

        if (user?.family_name && user?.given_name) {
            return `${user?.given_name} ${user?.family_name}`;
        }
        return user?.username;
    }

    return (
        <div className="app-container">
            {isUserAuthorized ? (
                <div>
                    <header className="app-header">
                        <div className="header-content">
                            <div className="username-display">
                                {getUsername(userInfo)}
                            </div>
                            <div className="profile-icon" onClick={handleProfileClick}>
                                {isProfileView ? <FiHome size={24} /> : <FiUser size={24} />}
                            </div>
                            <button className="btn logout-button" onClick={handleLogout}>
                                <IoExitOutline size={20} /> Logout
                            </button>
                        </div>
                    </header>
                    <div className="content">
                        {isProfileView ? (
                            <div>
                                <AuthenticationResponse derivedResponse={getDerivedAuthenticationState()} />
                            </div>
                        ) : (
                            <div>
                                <div className="home-image">
                                    <img alt="wa-ca-logo" src={WA_CA_LOGO} className="react-logo-image logo" />
                                </div>
                                <h2 className={"spa-app-description"}>
                                    Let your money flourish in the right environment.
                                </h2>
                                <h4 className={"spa-app-description"}>
                                    Building wealth doesn’t have to be complicated. With the right tools and guidance, anyone can make the most of their financial potential. Our comprehensive solutions are designed to help
                                    you grow and safeguard your wealth effortlessly, putting you on the path toward lasting financial security.
                                </h4>
                                <button className="btn secondary">Start Investing</button>

                                <div className="side-by-side-container">
                                    <h4 className="spa-app-description-justified">
                                        Whether you’re putting it aside, growing it through investments, or simply maximizing its potential, we offer an incredibly straightforward solution for wealth accumulation.
                                        Enjoy a competitive 7.50% APY on your savings, ensuring your money works as hard as you do. Take advantage of current rates with a structured approach to Canada Treasuries, allowing you to
                                        protect and expand your wealth with stability and confidence. Our award-winning automated investment services make it easy to build a diversified portfolio designed to meet your
                                        financial goals, no matter the market’s ups and downs. Plus, with personalized guidance and a seamless, user-friendly experience, we help you navigate the path to long-term financial
                                        success and peace of mind.
                                    </h4>
                                    <img alt="fin-app" src={FIN_APP} className="side-image" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="content">
                    <h2 className={"spa-app-description warning-message"}>
                        You don't have access to this application.
                    </h2>
                    <h4 className={"spa-app-description"}>
                        <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); signOut(); }}>Click here</a> to go back to login page.
                    </h4>
                </div>)}
        </div>
    );
};
