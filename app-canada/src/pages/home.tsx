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
import { DefaultLayout } from "../layouts/default";
import { AuthorizedHomePage } from "../components/authorized-home-page";
import { useLocation, useSearchParams } from "react-router-dom";
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
        getAccessToken,
        updateConfig
    } = useAuthContext();

    const { isDirectCAAccess } = props;

    const [derivedAuthenticationState, setDerivedAuthenticationState] = useState<DerivedState>(null);
    const [hasAuthenticationErrors, setHasAuthenticationErrors] = useState<boolean>(false);
    const [hasLogoutFailureError, setHasLogoutFailureError] = useState<boolean>();

    const search = useLocation().search;
    const stateParam = new URLSearchParams(search).get('state');
    const errorDescParam = new URLSearchParams(search).get('error_description');

    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");
    const sessionState = searchParams.get("session_state");

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

    const updateRedirectUrls = () => {
        updateConfig({
            clientID: authConfig?.caClientID,
            baseUrl: authConfig?.caBaseUrl,
            signInRedirectURL: authConfig?.signInRedirectURL + "/ca",
            signOutRedirectURL: authConfig?.signOutRedirectURL + "/ca"
        }).then(() => {
            console.log("Redirect urls updated successfully.");
        }).catch((error) => {
            console.error("Failed to update redirect urld:", error);
        });
    }

    const handleLogin = useCallback(() => {
        setHasLogoutFailureError(false);

        console.log("Redirecting to the login page...: " + isDirectCAAccess);

        let redirectOrgId = authConfig?.parentOrgId;
        if (isDirectCAAccess) {
            redirectOrgId = authConfig?.orgId;
            updateRedirectUrls();
        }

        const singInConfig = {
            fidp: "OrganizationSSO",
            orgId: redirectOrgId
        };

        signIn(singInConfig, code, sessionState, stateParam, undefined, undefined)
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

    return (
        <DefaultLayout
            isLoading={state.isLoading}
            hasErrors={hasAuthenticationErrors}
        >
            {
                state.isAuthenticated && derivedAuthenticationState
                    ? (
                        <AuthorizedHomePage derivedResponse={derivedAuthenticationState} signOut={signOut} />
                    )
                    : (
                        <div className="content" onLoad={() => {
                            handleLogin();
                        }}>
                            <div className="home-image">
                                <img alt="wa-ca-logo" src={WA_CA_LOGO} className="react-logo-image logo" />
                            </div>
                            <div className="loading-spinner"></div>
                            <h4 className={"spa-app-description"}>
                                Please wait while we take you to the login page.
                            </h4>
                            <h4 className={"spa-app-description"}>
                                If you have been watiting too long, <a href="login" className="login-link" onClick={(e) => { e.preventDefault(); handleLogin(); }}> click here</a> to log in.
                            </h4>
                        </div>
                    )
            }
        </DefaultLayout>
    );
};
