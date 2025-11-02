#using scripts\shared\array_shared;
#using scripts\shared\callbacks_shared;
#insert scripts\shared\shared.gsh;

#define MAX_PLAYERS 18
#define NUKE_STRING "nuke"

#precache( "fx", "zombie/fx_powerup_nuke_zmb" );
#precache( "string", "ZOMBIE_POWERUP_NUKE" );

#namespace zm_powerup_nuke;

REGISTER_SYSTEM_EX( "zm_powerup_nuke", &__init__, &__main__, undefined )

function __init__()
{
    clientfield::register( "actor", "zm_nuked", VERSION_TU1, 1, "counter" );
    
    zm_powerups::register_powerup( NUKE_STRING, &grab_nuke );
    zm_powerups::add_zombie_powerup( NUKE_STRING, NUKE_MODEL, &"ZOMBIE_POWERUP_NUKE" );
}

function grab_nuke( e_player )
{
    level thread nuke_powerup( self, e_player );
    luiNotifyEvent( &"zombie_notification", 1, &"ZOMBIE_POWERUP_NUKE" );
}

function nuke_powerup( e_powerup, e_player )
{
    e_player thread zm_powerups::powerup_vo( NUKE_STRING );
    
    a_zombies = getAiTeamArray( level.zombie_team );
    
    for ( i = 0; i < a_zombies.size; i++ )
    {
        if ( IS_TRUE( a_zombies[ i ].ignore_nuke ) )
            continue;
            
        a_zombies[ i ].marked_for_death = 1;
    }
    
    const LOCAL_DELAY = 0.5;
    wait LOCAL_DELAY;
}
