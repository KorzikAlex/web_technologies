import { createRouter, createWebHistory } from "vue-router";
import AdminPage from "@/pages/AdminPage.vue";
import BasicLayout from "@/shared/components/BasicLayout.vue";
import LoginPage from "@/pages/LoginPage.vue";

const router = createRouter(
    {
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: [
            {
                path: "",
                name: "layout",
                component: BasicLayout,
                redirect: {
                    name: "admin"
                },
                children:
                    [
                        {
                            path: "/admin",
                            name: "admin",
                            meta: {
                                name: "Панель администратора",
                            },
                            component: AdminPage,
                        },
                    ],
                beforeEnter: [
                    // (to, from, next) => {
                    //     console.log(`Navigating to ${to.fullPath} from ${from.fullPath}`);
                    //     next();
                    // }
                ],
            },
            {
                path: "/login",
                name: "login",
                component: LoginPage
            }
        ],
    }
);

export default router;
