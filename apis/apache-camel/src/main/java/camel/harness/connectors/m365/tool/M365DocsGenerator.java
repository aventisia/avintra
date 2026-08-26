package camel.harness.connectors.m365.tool;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365Actions;

/**
 * Generates the M365 capability matrix and per-service action reference from
 * the single source of truth {@link M365Actions}.
 *
 * <p>Outputs:</p>
 * <ul>
 *   <li>{@code docs/m365/capability-matrix.md} — one row per action with
 *       service, action, support status, method + path, inputs, outputs,
 *       required permissions, and a doc link.</li>
 *   <li>{@code docs/m365/actions-<service>.md} — a focused reference per service
 *       family (service families with no actions are skipped).</li>
 * </ul>
 *
 * <p>Run after any change to {@code M365Actions} to keep docs in sync:</p>
 * <pre>
 *   mvnw exec:java -Dexec.mainClass=camel.harness.connectors.m365.tool.M365DocsGenerator
 * </pre>
 */
public final class M365DocsGenerator {

    private static final String DOCS_DIR = "docs/m365";
    private static final String DOC_BASE = "https://learn.microsoft.com/graph/api/";

    private M365DocsGenerator() {
    }

    public static void main(String[] args) throws Exception {
        M365Actions actions = new M365Actions();
        Path dir = Paths.get(DOCS_DIR);
        if (!Files.exists(dir) && Files.exists(Paths.get("apache-camel", DOCS_DIR))) {
            dir = Paths.get("apache-camel", DOCS_DIR);
        }
        Files.createDirectories(dir);

        String matrix = capabilityMatrix(actions);
        Path matrixPath = dir.resolve("capability-matrix.md");
        Files.writeString(matrixPath, matrix, StandardCharsets.UTF_8);

        List<String> written = new ArrayList<>();
        for (Map.Entry<String, List<M365Action>> entry : byService(actions).entrySet()) {
            Path p = dir.resolve("actions-" + entry.getKey() + ".md");
            Files.writeString(p, serviceReference(entry.getKey(), entry.getValue()), StandardCharsets.UTF_8);
            written.add(p.getFileName().toString());
        }

        System.out.println("Generated " + matrixPath + " ("
            + actions.all().size() + " actions) and " + written.size() + " per-service files.");
    }

    /** Group the registry by service family, preserving insertion order. */
    public static Map<String, List<M365Action>> byService(M365Actions actions) {
        Map<String, List<M365Action>> grouped = new LinkedHashMap<>();
        for (M365Action action : actions.all()) {
            grouped.computeIfAbsent(action.service(), k -> new ArrayList<>()).add(action);
        }
        return grouped;
    }

    /** Render the full capability matrix as Markdown. */
    public static String capabilityMatrix(M365Actions actions) {
        StringBuilder sb = new StringBuilder();
        sb.append("# M365 Capability Matrix\n\n");
        sb.append("Generated from the M365 action registry (`M365Actions`). Each row is one\n");
        sb.append("action exposed through Apache Camel `camel-http` against the Microsoft Graph\n");
        sb.append("REST API. Support: **Supported** (fully), **Limited** (partial), **Not supported**\n");
        sb.append("(declared but unavailable).\n\n");
        sb.append("| Service | Action | Support | Method | Path | Inputs | Outputs | Permissions |\n");
        sb.append("| ------- | ------ | ------- | ------ | ---- | ------ | ------- | ----------- |\n");
        for (M365Action a : actions.all()) {
            sb.append("| ").append(a.service())
                .append(" | ").append(a.action())
                .append(" | ").append(a.supportStatus())
                .append(" | ").append(a.method())
                .append(" | ").append(displayPath(a))
                .append(" | ").append(j(a.inputFields()))
                .append(" | ").append(j(a.outputFields()))
                .append(" | ").append(j(a.requiredPermissions()))
                .append(" |\n");
        }
        return sb.toString();
    }

    private static String displayPath(M365Action a) {
        if (a.hasDelegate()) {
            return "(delegate)";
        }
        String p = a.path();
        if (p == null || p.isBlank()) {
            return "—";
        }
        // Keep paths short for the matrix: strip {params} to {}.
        return p.replaceAll("\\{([^}]+)}", "{}");
    }

    /** Render a per-service action reference file. */
    public static String serviceReference(String service, List<M365Action> actions) {
        StringBuilder sb = new StringBuilder();
        sb.append("# M365 — ").append(capitalize(service)).append(" actions\n\n");
        sb.append("Executed through Apache Camel `camel-http` against Microsoft Graph v1.0.\n\n");
        for (M365Action a : actions) {
            sb.append("## ").append(a.operation()).append('\n');
            sb.append("\n");
            sb.append(a.hasDescription() ? a.description() : a.operation());
            sb.append("\n\n");
            sb.append("- **Operation:** `").append(a.operation()).append("`\n");
            sb.append("- **Support:** ").append(a.supportStatus()).append('\n');
            sb.append("- **HTTP:** ").append(a.method()).append(' ');
            sb.append("`").append(a.path() == null || a.path().isBlank() ? "(delegate)" : a.path()).append("`\n");
            if (!a.queryParams().isEmpty()) {
                sb.append("- **Query params:** ").append(j(a.queryParams())).append('\n');
            }
            if (!a.inputFields().isEmpty()) {
                sb.append("- **Inputs:** ").append(j(a.inputFields())).append('\n');
            }
            if (!a.outputFields().isEmpty()) {
                sb.append("- **Outputs:** ").append(j(a.outputFields())).append('\n');
            }
            if (!a.requiredPermissions().isEmpty()) {
                sb.append("- **Required permissions:** ").append(j(a.requiredPermissions())).append('\n');
            }
            if (a.documentationUrl() != null && !a.documentationUrl().isBlank()) {
                String url = a.documentationUrl().startsWith("http")
                    ? a.documentationUrl() : DOC_BASE + a.documentationUrl();
                sb.append("- **Docs:** ").append(url).append('\n');
            }
            if (!a.errorCodes().isEmpty()) {
                sb.append("- **Documented Graph error codes:** ").append(j(a.errorCodes())).append('\n');
            }
            if (a.hasDelegate()) {
                sb.append("- **Impl:** delegated to `").append(a.delegate()).append("` domain service.\n");
            }
            sb.append('\n');
        }
        return sb.toString();
    }

    private static String j(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "—";
        }
        return String.join(", ", list);
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) {
            return s;
        }
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
