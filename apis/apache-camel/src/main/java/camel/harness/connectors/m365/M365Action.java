package camel.harness.connectors.m365;

import java.util.List;

/**
 * Descriptor for a single Microsoft Graph action exposed as a
 * {@code direct:m365.<service>.<action>} Camel route.
 *
 * <p>This is the modular extension point of the M365 connector: adding a new
 * action is a one-liner in {@link M365Actions} (plus optionally wiring it in the
 * connector metadata). All routes, validation, dispatch, schema, capability
 * matrix, and docs are derived from these descriptors.</p>
 *
 * @param service            service family, e.g. {@code "user"} or {@code "mail"}
 * @param action             action within the service, e.g. {@code "get"} or {@code "send"}
 * @param method             HTTP method used against the Microsoft Graph API
 * @param path               path template relative to the Graph base URL, e.g. {@code /users/{userId}}
 * @param pathParams         required path parameters (subset of {@code {name}} placeholders in {@code path})
 * @param queryParams        optional query parameters accepted by the action, including OData system
 *                           query options ({@code $filter}, {@code $select}, {@code $expand},
 *                           {@code $orderby}, {@code $top}, {@code $skiptoken}, {@code $search})
 * @param authRequired       whether the action requires an authenticated caller
 * @param paginated          whether the response is a paged list (enables {@code @odata.nextLink} aggregation)
 * @param delegate           optional bean name of a domain service method for complex multi-step
 *                           operations (e.g. {@code user.assign-license}). When set, the dispatcher
 *                           delegates to the service instead of the generic Graph call.
 * @param notes              human-readable notes for schema/docs generation
 * @param description        concise human-readable description of the action
 * @param requiredPermissions Microsoft Graph permission scopes required by this action (e.g.
 *                           {@code Mail.Send}, {@code Files.ReadWrite}); the canonical list is
 *                           documented per action for both app-only and delegated flows
 * @param documentationUrl   link to the Microsoft Graph documentation for this action
 * @param support            support status ({@link Support#SUPPORTED}, {@link Support#LIMITED},
 *                           {@link Support#NOT_SUPPORTED}) used by the capability matrix
 * @param inputFields        key input fields of the request payload, for docs/schema generation
 * @param outputFields       key fields of the response, for docs/schema generation
 * @param errorCodes         documented Microsoft Graph {@code error.code} values for this action
 */
public record M365Action(
        String service,
        String action,
        String method,
        String path,
        List<String> pathParams,
        List<String> queryParams,
        boolean authRequired,
        boolean paginated,
        String delegate,
        List<String> notes,
        String description,
        List<String> requiredPermissions,
        String documentationUrl,
        String support,
        List<String> inputFields,
        List<String> outputFields,
        List<String> errorCodes) {

    /** Canonical support status of an action, used by the capability matrix. */
    public enum Support {
        SUPPORTED, LIMITED, NOT_SUPPORTED;

        public static Support from(String value) {
            if (value == null || value.isBlank()) {
                return SUPPORTED;
            }
            try {
                return valueOf(value.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return SUPPORTED;
            }
        }
    }

    /** Convenience constructor filling the extended metadata fields with defaults. */
    public M365Action(String service, String action, String method, String path,
            List<String> pathParams, List<String> queryParams,
            boolean authRequired, boolean paginated,
            String delegate, List<String> notes) {
        this(service, action, method, path, pathParams, queryParams, authRequired, paginated,
            delegate, notes, null, List.of(), null, Support.SUPPORTED.name(),
            List.of(), List.of(), List.of());
    }

    /** Camel route id, e.g. {@code direct:m365.user.get}. */
    public String route() {
        return "direct:m365." + service + "." + action;
    }

    /** Dotted operation name used by the request envelope, e.g. {@code user.get}. */
    public String operation() {
        return service + "." + action;
    }

    public boolean hasPathParams() {
        return pathParams != null && !pathParams.isEmpty();
    }

    public boolean hasDelegate() {
        return delegate != null && !delegate.isBlank();
    }

    public boolean hasDescription() {
        return description != null && !description.isBlank();
    }

    /** Canonical support status, defaulting to {@link Support#SUPPORTED}. */
    public Support supportStatus() {
        return Support.from(support);
    }

    public boolean isLimited() {
        return supportStatus() == Support.LIMITED;
    }

    public boolean isNotSupported() {
        return supportStatus() == Support.NOT_SUPPORTED;
    }

    public static M365Action of(String service, String action, String method, String path) {
        return new M365Action(service, action, method, path, List.of(), List.of(), true, false, null, List.of());
    }

    public static M365Action of(String service, String action, String method, String path,
            List<String> pathParams) {
        return new M365Action(service, action, method, path, pathParams, List.of(), true, false, null, List.of());
    }

    public static M365Action of(String service, String action, String method, String path,
            List<String> pathParams, List<String> queryParams) {
        return new M365Action(service, action, method, path, pathParams, queryParams, true, false, null, List.of());
    }

    public static M365Action of(String service, String action, String method, String path,
            List<String> pathParams, List<String> queryParams, boolean authRequired, boolean paginated,
            List<String> notes) {
        return new M365Action(service, action, method, path, pathParams, queryParams,
            authRequired, paginated, null, notes);
    }

    /** Rich factory: full canonical metadata for docs, permissions, and schema generation. */
    public static M365Action rich(String service, String action, String method, String path,
            List<String> pathParams, List<String> queryParams, boolean authRequired, boolean paginated,
            List<String> notes, String description, List<String> requiredPermissions,
            String documentationUrl, Support support, List<String> inputFields,
            List<String> outputFields, List<String> errorCodes) {
        return new M365Action(service, action, method, path, pathParams, queryParams,
            authRequired, paginated, null, notes, description, requiredPermissions,
            documentationUrl, support.name(), inputFields, outputFields, errorCodes);
    }

    public static M365Action delegate(String service, String action, String delegate) {
        return new M365Action(service, action, "POST", "", List.of(), List.of(), true, false, delegate, List.of());
    }

    /** Delegate with a human-readable description (used by docs and schema). */
    public static M365Action delegate(String service, String action, String delegate, String description) {
        return new M365Action(service, action, "POST", "", List.of(), List.of(), true, false, delegate,
            List.of(), description, List.of(), null, Support.SUPPORTED.name(), List.of(), List.of(), List.of());
    }

    /** Delegate with description and required Graph permission scopes. */
    public static M365Action delegate(String service, String action, String delegate, String description,
            List<String> requiredPermissions) {
        return new M365Action(service, action, "POST", "", List.of(), List.of(), true, false, delegate,
            List.of(), description, requiredPermissions, null, Support.SUPPORTED.name(),
            List.of(), List.of(), List.of());
    }
}
