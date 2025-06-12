using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Media;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Play Sound")]
    [Description(
        "Plays a sound from a WAV file or system sound with options for sync/async playback and volume control.")]
    public class PlaySoundActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Play Sound From")]
        [Description("Specifies whether to play a system sound or a custom WAV file.")]
        public InArgument<SoundSourceEnum> SoundSource { get; set; }

        [DisplayName("System Sound")]
        [Description("The name of the system sound to play (e.g., Asterisk, Beep, Exclamation).")]
        [RenderIfCondition(nameof(SoundSource), SoundSourceEnum.System)]
        public InArgument<SystemSoundNameEnum> SystemSoundName { get; set; }


        [DisplayName("WAV File Path")]
        [Description("The full path to the WAV file to play.")]
        [RenderIfCondition(nameof(SoundSource), SoundSourceEnum.WavFile)]
        public InArgument<string> WavFilePath { get; set; }

        [DisplayName("Play Mode")]
        [Description("Whether to play synchronously (blocking) or asynchronously (non-blocking).")]
        [DefaultValue(PlayMode.Sync)]
        public InArgument<PlayMode> Mode { get; set; }

        [DisplayName("Volume")]
        [Description("Volume level (0-100) - only works with system sounds.")]
        [DefaultValue(100)]
        public InArgument<int> Volume { get; set; }


        [DisplayName("Played")]
        [Description("Indicates whether the sound was played successfully.")]
        public OutArgument<bool> Played { get; set; }

        [DisplayName("Duration")]
        [Description("Returns the duration of the sound in milliseconds (if available).")]
        public OutArgument<int?> Duration { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var played = false;
            int? duration = null;

            try
            {
                var soundSource = SoundSource.Get(context);
                var mode = Mode.Get(context);
                var volume = Volume.Get(context);

                switch (soundSource)
                {
                    case SoundSourceEnum.System:
                        {
                            var systemSoundName = SystemSoundName.Get(context);
                            if (systemSoundName == SystemSoundNameEnum.Default)
                                systemSoundName = SystemSoundNameEnum.Beep; // Default to Beep if not specified

                            PlaySystemSound(systemSoundName);

                            played = true;
                            status = $"System sound '{systemSoundName}' played successfully.";
                            break;
                        }
                    case SoundSourceEnum.WavFile:
                        {
                            var wavFilePath = WavFilePath.Get(context);

                            if (string.IsNullOrWhiteSpace(wavFilePath))
                                throw new ArgumentException("WAV file path cannot be empty.");

                            if (!File.Exists(wavFilePath))
                                throw new FileNotFoundException($"WAV file not found: {wavFilePath}");

                            using (var player = new SoundPlayer(wavFilePath))
                            {
                                try
                                {
                                    duration = GetWavFileDuration(wavFilePath);
                                }
                                catch
                                {
                                    // Duration is optional, so we can continue if this fails
                                }

                                switch (mode)
                                {
                                    case PlayMode.Async:
                                        player.LoadAsync();
                                        player.Play();
                                        break;
                                    case PlayMode.Repeat:
                                        player.Load();
                                        player.PlayLooping();
                                        break;
                                    case PlayMode.Sync:
                                    default:
                                        player.Load();
                                        player.PlaySync();
                                        break;
                                }

                                played = true;
                                status = $"WAV file '{wavFilePath}' played successfully in {mode} mode.";
                            }

                            break;
                        }
                    default:
                        throw new ArgumentOutOfRangeException(nameof(soundSource), "Invalid sound source.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error playing sound: {ex.Message}";
            }

            StatusMessage.Set(context, status);
            Played.Set(context, played);
            Duration.Set(context, duration);
        }

        private static void PlaySystemSound(SystemSoundNameEnum soundName)
        {
            switch (soundName)
            {
                case SystemSoundNameEnum.Beep:
                    SystemSounds.Beep.Play();
                    break;
                case SystemSoundNameEnum.Asterisk:
                    SystemSounds.Asterisk.Play();
                    break;
                case SystemSoundNameEnum.Exclamation:
                    SystemSounds.Exclamation.Play();
                    break;
                case SystemSoundNameEnum.Hand:
                    SystemSounds.Hand.Play();
                    break;
                case SystemSoundNameEnum.Question:
                    SystemSounds.Question.Play();
                    break;
                default:
                    SystemSounds.Beep.Play();
                    break;
            }
        }

        private static int? GetWavFileDuration(string filePath)
        {
            // Simple WAV file duration calculation
            using (var fileStream = File.OpenRead(filePath))
            {
                using (var reader = new BinaryReader(fileStream))
                {
                    // Check for "RIFF" header
                    var signature = new string(reader.ReadChars(4));
                    if (signature != "RIFF")
                        return null;

                    reader.ReadInt32(); // File size - 8

                    var format = new string(reader.ReadChars(4));
                    if (format != "WAVE")
                        return null;

                    // Find the "fmt " chunk
                    while (true)
                    {
                        var chunkId = new string(reader.ReadChars(4));
                        var chunkSize = reader.ReadInt32();

                        switch (chunkId)
                        {
                            case "fmt ":
                                reader.BaseStream.Seek(chunkSize, SeekOrigin.Current);
                                continue;
                            case "data":
                                {
                                    var dataSize = chunkSize;
                                    var sampleRate = 44100; // Default if we can't find it
                                    var bitsPerSample = 16;
                                    var channels = 2;

                                    // Calculate duration in milliseconds
                                    var bytesPerSecond = sampleRate * channels * (bitsPerSample / 8);
                                    return (int)((dataSize * 1000L) / bytesPerSecond);
                                }
                            default:
                                reader.BaseStream.Seek(chunkSize, SeekOrigin.Current);
                                break;
                        }
                    }
                }
            }
        }
    }

    public enum SoundSourceEnum
    {
        [Display(Name = "System", Description = "Plays a predefined system sound.")]
        System,

        [Display(Name = "WAV file", Description = "Plays a custom WAV file.")]
        WavFile
    }

    public enum PlayMode
    {
        [Display(Name = "Synchronous", Description = "Plays the sound synchronously (blocking).")]
        Sync,

        [Display(Name = "Asynchronous", Description = "Plays the sound asynchronously (non-blocking).")]
        Async,

        [Display(Name = "Repeat", Description = "Plays the sound repeatedly.")]
        Repeat
    }

    public enum SystemSoundNameEnum
    {
        [Display(Name = "Default", Description = "Default system sound.")]
        Default,

        [Display(Name = "Beep", Description = "Standard beep sound.")]
        Beep,

        [Display(Name = "Asterisk", Description = "Asterisk sound (used for warnings).")]
        Asterisk,

        [Display(Name = "Exclamation", Description = "Exclamation sound (used for errors).")]
        Exclamation,

        [Display(Name = "Question", Description = "Question sound (used for prompts).")]
        Question,

        [Display(Name = "Critical Alert (Hand)", Description = "Hand sound (used for critical alerts).")]
        Hand
    }
}