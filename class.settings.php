<?php
namespace Coauthor;

class Settings {
	private $option_group = 'coauthor';

	public function __construct() {
		$this->settings_options = get_option( $this->option_group );

		if ( is_admin() ) {
			add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
			add_action( 'admin_init', array( $this, 'settings_page_init' ) );
		}
	}
	public function add_plugin_page() {
		add_options_page(
			'Coauthor', // page_title
			'Coauthor', // menu_title
			'manage_options', // capability
			$this->option_group, // menu_slug
			array( $this, 'create_admin_page' ) // function
		);
	}

	public function create_admin_page() {
		?>
	
		<div class="wrap">
			<h1>Coauthor</h1>
			<?php settings_errors(); ?>
	
			<form method="post" action="options.php">
				<?php
				settings_fields( 'coauthor' );
				do_settings_sections( 'settings-admin' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
	public function settings_page_init() {

		add_settings_section(
			'settings-section', // id
			'Open AI Settings', // title
			function() {
				_e( 'Here are settings your OpenAI Connection' );
			},
			'settings-admin' // page
		);

		add_settings_field(
			'openai-token', // id
			'OpenAI Token', // title
			function() {
				$this->generate_field( 'text', 'openai-token', 'sk-...', __( 'Get the token from the OpenAI dashboad' ) );
			},
			'settings-admin', // page
			'settings-section' // section
		);

		add_settings_section(
			'experimental', // id
			'Experimental Settings', // title
			function() {
				_e( 'Do not touch these unless you know what you are doing' );
			},
			'settings-admin' // page
		);

		add_settings_field(
			'use-jetpack', // id
			'BETA: Use Jetpack', // title
			function() {
				$this->generate_field( 'checkbox', 'use-jetpack', __( 'Use Jetpack Connection instead of OpenAI token' ) );
			},
			'settings-admin', // page
			'experimental' // section
		);
		register_setting(
			$this->option_group, // option_group
			$this->option_group, // option_name
			function( $input ) {
				$sanitary_values = array();
				if ( isset( $input['openai-token'] ) ) {
					$sanitary_values['openai-token'] = sanitize_text_field( $input['openai-token'] );
				}
				
				if( isset( $input['use-jetpack'] ) && $input['use-jetpack'] === 'use-jetpack' ) {
					$sanitary_values['use-jetpack'] = 1;
				} else {
					$sanitary_values['use-jetpack'] = 0;
				}
				return $sanitary_values;
			}
		);

	}
	private function generate_field( $type, $id, $placeholder = '', $label = '' ) {
		if( $type === 'text' ) {
			printf(
				'<input class="large-text" type="text" name="%5$s[%1$s]" id="%1$s" value="%2$s" placeholder="%3$s"><br/><label for="%1$s">%4$s</label>',
				$id,
				isset( $this->settings_options[ $id ] ) ? esc_attr( $this->settings_options[ $id ] ) : '',
				$placeholder,
				$label,
				$this->option_group
			);
		} else if ( $type === 'checkbox' ) {
			printf(
				'<input type="checkbox" name="%4$s[%1$s]" id="%1$s" value="%1$s" %2$s><label for="%1$s">%3$s</label>',
				$id,
				( isset( $this->settings_options[ $id ] ) && $this->settings_options[ $id ] ) ? 'checked' : '',
				$label,
				$this->option_group
			);
		}
	}
}
