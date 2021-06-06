import Layout from "./components/Layout";
import PageEdit from "./components/pages/PageEdit";
import PageList from "./components/pages/PageList";
import {
    BrowserRouter,
    Switch,
    Route,
} from "react-router-dom";
import PageNotFound from "./components/pages/PageNotFound";
import PageJobs from "./components/pages/PageJobs";


function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Switch>
                    <Route path="/jobs">
                        <PageJobs/>
                    </Route>
                    <Route path={["/edit/:slug", "/edit"]}>
                        <PageEdit/>
                    </Route>
                    <Route exact path="/">
                        <PageList/>
                    </Route>
                    <Route path="*">
                        <PageNotFound/>
                    </Route>
                </Switch>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
