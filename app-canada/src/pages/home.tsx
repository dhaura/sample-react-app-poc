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

import { BasicUserInfo, Hooks, useAuthContext } from "@asgardeo/auth-react";
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { default as authConfig } from "../config.json";
import WA_CA_LOGO from "../images/wa-ca-logo.png";
import FIN_APP from "../images/financial-app.jpg";
import { DefaultLayout } from "../layouts/default";
import { AuthenticationResponse } from "../components";
import { useLocation } from "react-router-dom";
import { LogoutRequestDenied } from "../components/LogoutRequestDenied";
import { USER_DENIED_LOGOUT } from "../constants/errors";

interface DerivedState {
    authenticateResponse: BasicUserInfo,
    accessToken: string,
    idToken: string[],
    decodedIdTokenHeader: string,
    decodedIDTokenPayload: Record<string, string | number | boolean>;
}

/**
 * Home Page component prop types interface.
 */
interface HomePagePropsInterface {
    /**
     * Whether direct CA region access is required.
     */
    isDirectCAAccess?: boolean;
}

/**
 * Home page for the Sample.
 *
 * @param {HomePagePropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const HomePage: FunctionComponent<HomePagePropsInterface> = (props: HomePagePropsInterface): ReactElement => {

    const {
        state,
        signIn,
        signOut,
        getBasicUserInfo,
        getIDToken,
        getDecodedIDToken,
        on,
        getAccessToken
    } = useAuthContext();

    const { isDirectCAAccess } = props;

    const [derivedAuthenticationState, setDerivedAuthenticationState] = useState<DerivedState>(null);
    const [hasAuthenticationErrors, setHasAuthenticationErrors] = useState<boolean>(false);
    const [hasLogoutFailureError, setHasLogoutFailureError] = useState<boolean>();

    const search = useLocation().search;
    const stateParam = new URLSearchParams(search).get('state');
    const errorDescParam = new URLSearchParams(search).get('error_description');

    useEffect(() => {

        if (!state?.isAuthenticated) {
            return;
        }

        (async (): Promise<void> => {
            const basicUserInfo = await getBasicUserInfo();
            const accessToken = await getAccessToken();
            const idToken = await getIDToken();
            const decodedIDToken = await getDecodedIDToken();

            const derivedState: DerivedState = {
                authenticateResponse: basicUserInfo,
                accessToken: accessToken,
                idToken: idToken.split("."),
                decodedIdTokenHeader: JSON.parse(atob(idToken.split(".")[0])),
                decodedIDTokenPayload: decodedIDToken
            };

            setDerivedAuthenticationState(derivedState);
        })();
    }, [state.isAuthenticated, getBasicUserInfo, getIDToken, getDecodedIDToken]);

    useEffect(() => {
        if (stateParam && errorDescParam) {
            if (errorDescParam === "End User denied the logout request") {
                setHasLogoutFailureError(true);
            }
        }
    }, [stateParam, errorDescParam]);

    const handleLogin = useCallback(() => {
        setHasLogoutFailureError(false);

        console.log("Redirecting to the login page...: " + isDirectCAAccess);

        let redirectOrgId = authConfig?.parentOrgId;
        if (isDirectCAAccess) {
            redirectOrgId = authConfig?.orgId;
        }

        signIn({
            fidp: "OrganizationSSO",
            orgId: redirectOrgId
        })
            .catch(() => setHasAuthenticationErrors(true));
    }, [signIn]);

    /**
      * handles the error occurs when the logout consent page is enabled
      * and the user clicks 'NO' at the logout consent page
      */
    useEffect(() => {
        on(Hooks.SignOut, () => {
            setHasLogoutFailureError(false);
        });

        on(Hooks.SignOutFailed, () => {
            if (!errorDescParam) {
                handleLogin();
            }
        })
    }, [on, handleLogin, errorDescParam]);

    const handleLogout = () => {
        signOut();
    };

    // If `clientID` is not defined in `config.json`, show a UI warning.
    if (!authConfig?.clientID) {

        return (
            <div className="content">
                <h2>You need to update the Client ID to proceed.</h2>
                <p>Please open &quot;src/config.json&quot; file using an editor, and update
                    the <code>clientID</code> value with the registered application&apos;s client ID.</p>
                <p>Visit repo <a
                    href="https://github.com/asgardeo/asgardeo-auth-react-sdk/tree/master/samples/asgardeo-react-app">README</a> for
                    more details.</p>
            </div>
        );
    }

    if (hasLogoutFailureError) {
        return (
            <LogoutRequestDenied
                errorMessage={USER_DENIED_LOGOUT}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
            />
        );
    }

    // State to manage the collapse status.
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Function to toggle the collapse state.
    const toggleCollapse = () => {
        setIsCollapsed(prevState => !prevState);
    };

    return (
        <DefaultLayout
            isLoading={state.isLoading}
            hasErrors={hasAuthenticationErrors}
        >
            {
                state.isAuthenticated
                    ? (
                        <div className="content">
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
                            <button className="btn secondary">
                                Start Investing
                            </button>
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
                           
                            <div className="collapsible-box">
                                <div className="toggle-button" onClick={toggleCollapse}>
                                    {isCollapsed ? '▼' : '▲'}
                                    <span className="toggle-text">{isCollapsed ? 'Show Profile' : 'Hide Profile'}</span>
                                </div>

                                {!isCollapsed && (
                                    <div className="content">
                                        <AuthenticationResponse
                                            derivedResponse={derivedAuthenticationState}
                                        />
                                    </div>
                                )}
                            </div>
                            <button
                                className="btn primary mt-4"
                                onClick={() => {
                                    handleLogout();
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )
                    : (
                        <div className="content">
                            <div className="home-image">
                                <img alt="wa-ca-logo" src={WA_CA_LOGO} className="react-logo-image logo" />
                            </div>
                            <h4 className={"spa-app-description"}>
                                Please wait while we take you to the login page.
                            </h4>
                            <h4 className={"spa-app-description"}>
                                If you have been watiting too long click on the "Login" button below.
                            </h4>
                            <button
                                className="btn primary"
                                onClick={() => {
                                    handleLogin();
                                }}
                            >
                                Login
                            </button>
                        </div>
                    )
            }
        </DefaultLayout>
    );
};
