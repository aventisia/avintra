using System;
using System.Activities;
using System.ComponentModel;
using System.Media;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Play Sound"), Description("Plays a sound from a WAV file.")]
    public class PlaySoundActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the WAV file.")]
        public InArgument<string> SoundFilePath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var soundFilePath = SoundFilePath.Get(context);
            var status = "";

            try
            {
                var player = new SoundPlayer(soundFilePath);
                player.PlaySync();
                StatusMessage.Set(context, "Sound played successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error playing sound: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}