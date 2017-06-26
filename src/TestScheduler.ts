import { Scheduler } from 'most'

export type Task = {
  active: boolean,
  run(time: number): void,
  error(time: number, e: Error): void,
  dispose(): void
}

class ScheduledTask {
  active = true
  constructor(
    public time: number,
    public period: number,
    public task: Task,
    public scheduler: Scheduler
  ) {}

  run() {
    this.task.run(this.time)
  }

  error(e: Error) {
    this.task.error(this.time, e)
  }

  dispose() {
    this.scheduler.cancel(this as any)
    return this.task.dispose()
  }
}

export class TestScheduler implements Scheduler {
  _scheduled: ScheduledTask[] = []
  _now = 0

  now() {
    return this._now
  }

  asap(task: Task): ScheduledTask {
    return this.schedule(0, -1, task)
  }

  delay(delay: number, task: Task): ScheduledTask {
    return this.schedule(delay, -1, task)
  }

  periodic(period: number, task: Task): ScheduledTask {
    return this.schedule(0, period, task)
  }

  schedule(delay: number, period: number, task: Task): ScheduledTask {
    const now = this.now()
    const st = new ScheduledTask(now + Math.max(0, delay), period, task, this)
    this._scheduled.push(st)
    return st
  }

  cancel(task: Task) {
    task.active = false
    const idx = this._scheduled.findIndex(st => st.task === task)
    if (idx !== -1) {
      this._scheduled.splice(idx, 0)
    }
  }

  cancelAll(f: (task: Task) => boolean) {
    this._scheduled = this._scheduled.filter(st => {
      if (f(st.task)) {
        st.task.active = false
        return true
      }
    })
  }

  runAll() {
    this._scheduled.forEach(runScheduled)
    this._scheduled = []
  }
}

function runPeriod(st: ScheduledTask) {
  if (st.period >= 0 && st.active) {
    st.time += st.period
    setTimeout(() => runScheduled(st), 0)
  }
}

function runScheduled(st: ScheduledTask) {
  try {
    st.run()
  } catch (e) {
    st.error(e)
  }
  runPeriod(st)
}
