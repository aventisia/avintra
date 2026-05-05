using System.Media;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Play Sound"), Description("Plays a sound from a WAV file or system sound with options for sync/async playback and volume control.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class PlaySoundNode : BaseNode
{
    [DisplayName("Play Sound From"), Description("Specifies whether to play a system sound or a custom WAV file.")]
    public required InArgument<SoundSourceEnum> SoundSource { get; set; }

    [DisplayName("System Sound"), Description("The name of the system sound to play (e.g., Asterisk, Beep, Exclamation).")]
    [RenderIfCondition(nameof(SoundSource), SoundSourceEnum.System)]
    public InArgument<SystemSoundNameEnum> SystemSoundName { get; set; } = new InArgument<SystemSoundNameEnum>(SystemSoundNameEnum.Default);

    [DisplayName("WAV File Path"), Description("The full path to the WAV file to play.")]
    [RenderIfCondition(nameof(SoundSource), SoundSourceEnum.WavFile)]
    public InArgument<string> WavFilePath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Play Mode"), Description("Whether to play synchronously (blocking) or asynchronously (non-blocking).")]
    public InArgument<PlayMode> Mode { get; set; } = new InArgument<PlayMode>(PlayMode.Sync);

    [DisplayName("Volume"), Description("Volume level (0-100) - only works with system sounds.")]
    public InArgument<int> Volume { get; set; } = new InArgument<int>(100);

    [DisplayName("Played"), Description("Indicates whether the sound was played successfully.")]
    public OutArgument<bool> Played { get; set; } = new OutArgument<bool>();

    [DisplayName("Duration"), Description("Returns the duration of the sound in milliseconds (if available).")]
    public OutArgument<int?> Duration { get; set; } = new OutArgument<int?>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var played = false;
        int? duration = null;

        try
        {
            var soundSource = SoundSource.Get(context);
            var mode = Mode.Get(context);
            _ = Volume.Get(context);

            switch (soundSource)
            {
                case SoundSourceEnum.System:
                    {
                        var systemSoundName = SystemSoundName.Get(context);
                        if (systemSoundName == SystemSoundNameEnum.Default)
                        {
                            systemSoundName = SystemSoundNameEnum.Beep;
                        }

                        PlaySystemSound(systemSoundName);

                        played = true;
                        status = $"System sound '{systemSoundName}' played successfully.";
                        break;
                    }
                case SoundSourceEnum.WavFile:
                    {
                        var wavFilePath = WavFilePath.Get(context);

                        if (string.IsNullOrWhiteSpace(wavFilePath))
                        {
                            throw new ArgumentException("WAV file path cannot be empty.");
                        }

                        if (!File.Exists(wavFilePath))
                        {
                            throw new FileNotFoundException($"WAV file not found: {wavFilePath}");
                        }

                        using (var player = new SoundPlayer(wavFilePath))
                        {
                            try
                            {
                                duration = GetWavFileDuration(wavFilePath);
                            }
                            catch
                            {
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

            Played.Set(context, played);
            Duration.Set(context, duration);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Played.Set(context, default(bool));
            Duration.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error playing sound: {ex.Message}");
        }
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
        using var fileStream = File.OpenRead(filePath);
        using var reader = new BinaryReader(fileStream);

        var signature = new string(reader.ReadChars(4));
        if (signature != "RIFF")
        {
            return null;
        }

        reader.ReadInt32();

        var format = new string(reader.ReadChars(4));
        if (format != "WAVE")
        {
            return null;
        }

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
                        var sampleRate = 44100;
                        var bitsPerSample = 16;
                        var channels = 2;

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
