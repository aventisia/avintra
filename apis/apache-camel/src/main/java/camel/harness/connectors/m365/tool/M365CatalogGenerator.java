package camel.harness.connectors.m365.tool;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import camel.harness.connectors.m365.M365Actions;

/**
 * Regenerates the {@code operations:} list of the {@code m365} entry in
 * {@code src/main/resources/connectors.yml} from the single source of truth,
 * {@link M365Actions}. All other connector entries and the m365
 * config/auth/notes sections are preserved byte-for-byte.
 *
 * <p>Usage (from the project root):</p>
 * <pre>
 *   mvnw exec:java -Dexec.mainClass=camel.harness.connectors.m365.tool.M365CatalogGenerator
 * </pre>
 *
 * <p>The generated list is also guarded at test time by
 * {@code M365CatalogConsistencyTest}, which fails if the YAML and the Java
 * registry ever drift.</p>
 */
public final class M365CatalogGenerator {

    /** Path to connectors.yml relative to the project working directory. */
    private static final String CONNECTORS_YML = "src/main/resources/connectors.yml";

    private M365CatalogGenerator() {
    }

    public static void main(String[] args) throws IOException {
        Path file = Paths.get(CONNECTORS_YML);
        if (!Files.exists(file)) {
            // Allow running from the module root as well.
            file = Paths.get("apache-camel", CONNECTORS_YML);
        }
        String content = Files.readString(file, StandardCharsets.UTF_8);
        String updated = regenerate(content);

        if (content.equals(updated)) {
            System.out.println("M365 operations list already up to date; no changes.");
            return;
        }
        Files.writeString(file, updated, StandardCharsets.UTF_8);
        M365Actions actions = new M365Actions();
        System.out.println("Regenerated connectors.yml m365 operations list ("
            + actions.operationNames().size() + " operations).");
    }

    /**
     * Returns {@code content} with the m365 {@code operations:} list replaced by
     * the current registry. Non-m365 sections are untouched. Line endings (LF or
     * CRLF) are detected from the input and preserved.
     *
     * <p>Implemented as a linear line scan (no backtracking regex) so it is safe
     * on large YAML files. Lines up to and including {@code   operations:} of the
     * {@code m365} block are kept; every following line that is a list entry
     * ({@code "    - ..."}) is replaced by the generated list; everything after
     * the list is preserved.</p>
     */
    public static String regenerate(String content) {
        M365Actions actions = new M365Actions();
        List<String> operations = actions.operationNames();

        boolean crlf = content.contains("\r\n");
        String[] lines = content.split("\r?\n", -1);
        int start = -1;   // index of the line "- name: m365"
        int ops = -1;     // index of the "  operations:" line in the m365 block
        for (int i = 0; i < lines.length; i++) {
            if (start < 0) {
                if (lines[i].startsWith("- name: m365")) {
                    start = i;
                }
            } else if (ops < 0) {
                if (lines[i].trim().equals("operations:")) {
                    ops = i;
                    break;
                }
            }
        }
        if (start < 0 || ops < 0) {
            throw new IllegalStateException(
                "Could not locate the m365 block with an operations: list in connectors.yml");
        }

        // End of the operation list: the first line after ops that is NOT a
        // list entry ("    - ...") or blank.
        int listEnd = ops + 1;
        while (listEnd < lines.length) {
            String line = lines[listEnd];
            if (line.isBlank() || line.startsWith("    - ")) {
                listEnd++;
            } else {
                break;
            }
        }

        String eol = crlf ? "\r\n" : "\n";
        StringBuilder out = new StringBuilder();
        // With split("\n", -1), a trailing newline produces one extra empty
        // element; skip it so we don't emit a double newline.
        boolean endsWithNewline = content.endsWith("\n");
        int effectiveLines = endsWithNewline ? lines.length - 1 : lines.length;
        // Everything up to and including the "   operations:" line.
        for (int i = 0; i <= ops; i++) {
            out.append(lines[i]).append(eol);
        }
        // The regenerated list.
        for (String op : operations) {
            out.append("    - ").append(op).append(eol);
        }
        // Everything after the original list.
        for (int i = listEnd; i < effectiveLines; i++) {
            out.append(lines[i]).append(eol);
        }
        return out.toString();
    }
}
