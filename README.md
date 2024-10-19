# Ace Block Roles

**Contributors:** Shane Rounce of AceMedia.ninja  
**Tags:** block, user roles, editor blocks, WordPress, security, plugin development  
**Requires at least:** 6.6  
**Tested up to:** 6.7  
**Stable tag:** 0.42  
**License:** GPLv2 or later  
**License URI:** https://www.gnu.org/licenses/gpl-2.0.html  

Easily manage and restrict access to WordPress editor blocks based on user roles, offering a streamlined way to configure which blocks are available to different roles, enhancing site security and customization.

## Description

Block Roles is a WordPress plugin designed to give site administrators control over which editor blocks are available for different user roles. This helps simplify the user experience by only displaying necessary blocks, ensuring a streamlined content editing process for various users.

### Key Features:
- **Role-Based Block Management:** Easily configure which editor blocks are available for specific user roles.
- **Dynamic Settings:** Full integration with WordPress settings, allowing for seamless updates and real-time changes.
- **AJAX-Based Updates:** Quick, smooth updates to settings without needing a full page refresh.
- **JSON Import/Export:** Share and back up your block settings configurations with ease.
- **Toggle All:** Easily enable or disable blocks for specific roles with a single click.

Block Roles simplifies the process of managing block availability in the WordPress editor, ensuring a user-friendly and role-specific editing experience.

## Installation

To get started with Block Roles:

1. Upload the plugin files to the `/wp-content/plugins/block-roles` directory, or install the plugin directly through the WordPress Plugins screen.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to **Block Roles** in your WordPress Admin to configure block settings for different user roles.

## Frequently Asked Questions

### How do I restrict blocks to specific roles?

Navigate to **Block Roles** in the admin menu, where you'll see a list of all blocks and available user roles. Use the checkboxes to specify which roles should have access to each block.

### Can I export and import block settings?

Yes, Block Roles provides an easy way to export your current settings as a JSON file, which can be imported on another WordPress site to replicate the configuration.

### Will this affect existing content?

No, existing content will not be affected. Block Roles only restricts which blocks can be added in the editor. Existing blocks in posts or pages will remain unchanged.

### Can I toggle all blocks for a specific role?

Yes, the **Toggle All** functionality allows you to quickly enable or disable all blocks for a specific role within each category.

## Screenshots

1. **Settings page** - Easily configure which blocks are available for different roles.
2. **Export/Import interface** - Share your configuration with JSON import/export.

## Changelog

### 0.42
**Release Date:** 2024-10-20
- Initial public release with role-based block restriction features.
- Dynamic settings page for managing blocks across various roles.
- **New Feature:** Seamless JSON import/export for easy sharing and backups.
- **Enhancement:** Added smooth AJAX-based updates to avoid page refreshes.
- **Improvement:** Toggle all functionality for quick configuration changes.

## Advanced Use

Block Roles is designed for developers and administrators who need more granular control over the WordPress editor. By restricting certain blocks to specific roles, you can create a tailored and more efficient editing environment. Additionally, the import/export functionality allows you to quickly replicate settings across multiple sites, making it ideal for multisite networks and agencies managing numerous client sites.
