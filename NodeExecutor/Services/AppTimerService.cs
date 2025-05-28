using System;
using System.Windows.Threading;

namespace NodeExecutor.Services
{
    public class AppTimerService
    {
        private readonly DispatcherTimer _timer;
        private DateTime _startTime;
        private TimeSpan _pausedTime = TimeSpan.Zero;
        private bool _isPaused = false;

        // Event or delegate for UI updates
        public event Action<TimeSpan> OnTick;

        public AppTimerService(TimeSpan interval)
        {
            _startTime = DateTime.Now;

            _timer = new DispatcherTimer
            {
                Interval = interval
            };

            _timer.Tick += Timer_Tick;
        }

        public void Start()
        {
            _timer.Start();
            _pausedTime = TimeSpan.Zero;
            _isPaused = false;
            _timer.Start();
        }

        public void Pause()
        {
            if (!_isPaused)
            {
                _timer.Stop();
                _pausedTime += DateTime.Now - _startTime;
                _isPaused = true;
            }
        }

        public void Resume()
        {
            if (_isPaused)
            {
                _startTime = DateTime.Now;
                _isPaused = false;
                _timer.Start();
            }
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            TimeSpan currentElapsed = _isPaused
                ? _pausedTime
                : _pausedTime + (DateTime.Now - _startTime);

            OnTick?.Invoke(currentElapsed);
        }
    }
}


