<?php
/**
 * Plugin Name: Block Roles
 * Description: A plugin to restrict block usage based on user roles.
 * Version: 0.42
 * Author: Shane Rounce
 * Text Domain: acemedia-block-roles
 */

// Add settings page in the admin menu
function acemedia_block_roles_add_admin_menu() {
    add_menu_page(
        __('Block Roles', 'acemedia-block-roles'),
        __('Block Roles', 'acemedia-block-roles'),
        'manage_options',
        'block-roles',
        'block_roles_settings_page',
        'dashicons-lock',
        20
    );
}
add_action('admin_menu', 'acemedia_block_roles_add_admin_menu');

function block_roles_enqueue_admin_scripts($hook) {
    // Only enqueue this script on the Block Roles settings page
    if ($hook !== 'toplevel_page_block-roles') {
        return;
    }

    // Enqueue WordPress block editor assets
    wp_enqueue_script('wp-blocks');  // Block types
    wp_enqueue_script('wp-element'); // React elements (used by blocks)
    wp_enqueue_script('wp-components'); // WordPress UI components (optional, if needed)
    wp_enqueue_script('wp-data'); // Data handling (optional)
    wp_enqueue_script('wp-dom-ready'); // To ensure DOM is ready

    wp_enqueue_style('block-roles-css', plugins_url('build/css/style-block-roles.min.css', __FILE__));

    // Enqueue your custom JavaScript file to fetch block icons
    wp_enqueue_script(
        'block-roles-fetch',
        plugin_dir_url(__FILE__) . 'build/js/block-roles.min.js', // Path to your custom JavaScript file
        array('wp-blocks', 'wp-element', 'wp-components', 'wp-data', 'wp-dom-ready'), // Dependencies
        false,
        true
    );

    // Pass PHP data to JavaScript if needed (for example, settings or localization)
    wp_localize_script('block-roles-fetch', 'blockRolesSettings', array(
        'block_roles_settings' => get_option('block_roles_settings', []),
        'nonce' => wp_create_nonce('acemedia_block_roles_nonce') // Add nonce for security
    ));
}
add_action('admin_enqueue_scripts', 'block_roles_enqueue_admin_scripts');

// Register plugin settings
function acemedia_block_roles_register_settings() {
    register_setting('block_roles', 'block_roles_settings');
}
add_action('admin_init', 'acemedia_block_roles_register_settings');

// Render the settings page
function block_roles_settings_page() {
    $roles = [];
    foreach (wp_roles()->roles as $role_slug => $role) {
        // Only show roles that can edit posts (i.e., have access to the editor)
        if (user_can(get_role($role_slug), 'edit_posts')) {
            $roles[sanitize_key($role_slug)] = $role;
        }
    }
    $blocks = WP_Block_Type_Registry::get_instance()->get_all_registered(); // Get all registered blocks

    // Retrieve saved settings
    $block_roles_settings = get_option('block_roles_settings', []);

    // Group blocks by category
    $grouped_blocks = [];
    foreach ($blocks as $block_name => $block) {
        $category = isset($block->category) ? sanitize_text_field($block->category) : 'uncategorized';
        if (!isset($grouped_blocks[$category])) {
            $grouped_blocks[$category] = [];
        }
        $grouped_blocks[$category][sanitize_text_field($block_name)] = $block;
    }
    ksort($grouped_blocks);
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Block Roles Settings', 'acemedia-block-roles'); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('block_roles'); ?>
            <?php foreach ($grouped_blocks as $category => $blocks): ?>
                <table class="wp-list-table widefat fixed striped">
                <colgroup>
        <col style="width: 30%;">
    </colgroup>
        <thead>
            <tr>
                <th><?php echo esc_html(ucfirst($category)); ?> <?php esc_html_e('Blocks', 'acemedia-block-roles'); ?></th>
                <?php foreach ($roles as $role_slug => $role) : ?>
                    <th><?php echo esc_html($role['name']); ?></th>
                <?php endforeach; ?>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($blocks as $block_name => $block) : ?>
    <?php if (strpos($block->title, '(deprecated)') !== false) continue; ?>
                    <tr>
                    <td data-block-name="<?php echo esc_attr($block_name); ?>" width="30%">
                        <span class="block-icon"></span> <!-- Placeholder for the block icon -->
                        <strong><?php echo esc_html($block->title ? $block->title : $block_name); ?></strong>
                        <small><?php echo esc_html($block_name); ?></small> <!-- Display block type -->
                    </td>
                    <?php foreach ($roles as $role_slug => $role) : ?>
                        <td>
    <label class="switch-container">
        <span class="switch">
            <input type="checkbox" class="individual-toggle" name="block_roles_settings[<?php echo esc_attr($block_name); ?>][<?php echo esc_attr($role_slug); ?>]"
            data-role="<?php echo esc_attr($role_slug); ?>" data-category="<?php echo esc_attr($category); ?>"
            <?php
            if (isset($block_roles_settings[$block_name][$role_slug])) {
                checked($block_roles_settings[$block_name][$role_slug], 1);
                $status = 'Available';
            } else {
                $status = 'Hidden';
            }
            ?>
            value="1">
            <span class="slider round"></span>
        </span>
        <span class="toggle-status"><?php echo esc_html($status); ?></span>
    </label>
</td>

                    <?php endforeach; ?>
                </tr>
            <?php endforeach; ?>

            <?php if (count($blocks) > 1) : ?>
                <tr class="toggle-all-row">
                    <td></td>
                    <?php foreach ($roles as $role_slug => $role) : ?>
    <td>
        <button type="button" class="toggle-all-btn" data-role="<?php echo esc_attr($role_slug); ?>" data-category="<?php echo esc_attr($category); ?>">
            <?php
            // Shorten "Administrator" to "Admin"
            $roleName = ($role['name'] === 'Administrator') ? __('Admin', 'acemedia-block-roles') : esc_html($role['name']);
            
            // Print the button text
            printf(
                esc_html__('Toggle %s %s', 'acemedia-block-roles'),
                $roleName,
                ucfirst(esc_html($category))
            );
            ?>
        </button>
    </td>
<?php endforeach; ?>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
<?php endforeach; ?>


<div class="block-roles-save-bar">

<?php
// Get the current date
$currentDate = date('Y-m-d'); // e.g., '2024-10-19'

// Get the site URL
$siteUrl = parse_url(get_site_url(), PHP_URL_HOST);

// Create the export filename
$exportFileName = $siteUrl . '-block-roles-' . $currentDate;
?>

<div class="block-roles-import-export">
    <button id="export-block-roles" class="button button-secondary" data-filename="<?php echo esc_attr($exportFileName); ?>" data-tooltip="Export current settings as <?php echo esc_html($exportFileName); ?>.json">
         <?php esc_html_e('Export Settings', 'acemedia-block-roles'); ?>
    </button>
<!-- Hidden file input -->
<input type="file" id="import-block-roles-file" accept=".json" style="display: none;">

<!-- Styled button to trigger the file input -->
<button type="button" id="import-block-roles-button" class="button button-secondary" data-tooltip="Upload a block-roles.json file to Import Settings from another WordPress website.">
    Import Settings
</button>

</div>

            <?php submit_button(__('Save Settings', 'acemedia-block-roles'), 'primary', 'save-block-roles-settings'); ?>
      
                </div>
      
        </form>
        
    </div>
    <?php
}

function acemedia_block_roles_filter_allowed_blocks($allowed_blocks, $block_editor_context) {
    $allowed_blocks = [];

    if (!is_user_logged_in()) {
        return $allowed_blocks;  // Return empty blocks if not logged in
    }

    $user = wp_get_current_user();
    $roles = $user->roles;
    $block_roles_settings = get_option('block_roles_settings', []);

    if (empty($block_roles_settings)) {
        return $allowed_blocks;  // No settings, return empty allowed blocks
    }

    $all_blocks = WP_Block_Type_Registry::get_instance()->get_all_registered();

    foreach ($all_blocks as $block_name => $block) {
        $allowed = false;
        if (isset($block_roles_settings[$block_name])) {
            foreach ($roles as $role) {
                if (isset($block_roles_settings[$block_name][$role]) && $block_roles_settings[$block_name][$role] == 1) {
                    $allowed = true;
                    break;
                }
            }
        }

        if ($allowed) {
            $allowed_blocks[] = sanitize_text_field($block_name);
        }
    }

    return $allowed_blocks;
}

add_filter('allowed_block_types_all', 'acemedia_block_roles_filter_allowed_blocks', 10, 2);

// AJAX handlers for save, import, and export remain the same.


// AJAX handler for saving block roles settings
function acemedia_block_roles_save_settings() {
    // Check for nonce security
    check_ajax_referer('acemedia_block_roles_nonce', 'security');

    // Get posted data
    $block_roles_settings = isset($_POST['block_roles_settings']) ? $_POST['block_roles_settings'] : [];

    // Save settings
    update_option('block_roles_settings', $block_roles_settings);

    // Send a success response with updated settings
    wp_send_json_success([
        'message' => __('Settings saved!', 'acemedia-block-roles'),
        'updated_settings' => $block_roles_settings // Return updated settings
    ]);
}
add_action('wp_ajax_acemedia_block_roles_save_settings', 'acemedia_block_roles_save_settings');

// AJAX handler for importing block roles settings
function acemedia_block_roles_import_settings() {
    // Check for nonce security
    check_ajax_referer('acemedia_block_roles_nonce', 'security');

    // Get posted data
    $block_roles_settings = isset($_POST['block_roles_settings']) ? $_POST['block_roles_settings'] : [];

    // Validate the data is in the expected format
    if (!is_array($block_roles_settings)) {
        wp_send_json_error(__('Invalid settings format.', 'acemedia-block-roles'));
    }

    // Save settings
    update_option('block_roles_settings', $block_roles_settings);

    // Send a success response with updated settings
    wp_send_json_success([
        'message' => __('Settings imported successfully.', 'acemedia-block-roles'),
        'updated_settings' => $block_roles_settings // Return updated settings
    ]);
}
add_action('wp_ajax_acemedia_block_roles_import_settings', 'acemedia_block_roles_import_settings');
