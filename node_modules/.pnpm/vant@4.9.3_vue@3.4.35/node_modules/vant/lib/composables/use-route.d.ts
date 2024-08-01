/**
 * Vue Router support
 */
import { type PropType, type ExtractPropTypes, type ComponentPublicInstance } from 'vue';
export declare const routeProps: {
    to: PropType<string | import("vue-router").RouteLocationAsRelativeGeneric | import("vue-router").RouteLocationAsPathGeneric>;
    url: StringConstructor;
    replace: BooleanConstructor;
};
export type RouteProps = ExtractPropTypes<typeof routeProps>;
export declare function route({ to, url, replace, $router: router, }: ComponentPublicInstance<RouteProps>): void;
export declare function useRoute(): () => void;
