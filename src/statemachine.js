import { createMachine, assign, sendParent } from "xstate";

export const createTodoMachine = ({ id, title, completed }) =>
  machine;
  //** Message https://stately.ai/registry/editor/56f1034b-d743-4833-9eb3-47af444f9c8b?machineId=d197bd6a-c522-4797-a3d9-8b57a94a00ba */
  export const machine=createMachine(
    {
      id: "todo",
      initial: "reading",
      context: {
        id,
        title,
        prevTitle: title,
        completed
      },
      on: {
        TOGGLE_COMPLETE: {
          actions: [
            assign({ completed: true }),
            sendParent((context) => ({ type: "TODO.COMMIT", todo: context }))
          ]
        },
        DELETE: "deleted"
      },
      states: {
        reading: {
          on: {
            SET_COMPLETED: {
              actions: [assign({ completed: true }), "commit"]
            },
            TOGGLE_COMPLETE: {
              actions: [
                assign({ completed: (context) => !context.completed }),
                "commit"
              ]
            },
            SET_ACTIVE: {
              actions: [assign({ completed: false }), "commit"]
            },
            EDIT: {
              target: "editing",
              actions: "focusInput"
            }
          }
        },
        editing: {
          entry: assign({ prevTitle: (context) => context.title }),
          on: {
            CHANGE: {
              actions: assign({
                title: (_, event) => event.value
              })
            },
            COMMIT: [
              {
                target: "reading",
                actions: sendParent((context) => ({
                  type: "TODO.COMMIT",
                  todo: context
                })),
                cond: (context) => context.title.trim().length > 0
              },
              { target: "deleted" }
            ],
            BLUR: {
              target: "reading",
              actions: sendParent((context) => ({
                type: "TODO.COMMIT",
                todo: context
              }))
            },
            CANCEL: {
              target: "reading",
              actions: assign({ title: (context) => context.prevTitle })
            }
          }
        },
        deleted: {
          onEntry: sendParent((context) => ({
            type: "TODO.DELETE",
            id: context.id
          }))
        }
      }
    },
    {
      actions: {
        commit: sendParent((context) => ({
          type: "TODO.COMMIT",
          todo: context
        })),
        focusInput: () => {}
      }
    }
  )