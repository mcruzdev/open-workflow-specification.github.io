---
title: Getting Started
description: Install the Serverless Workflow Java SDK and read your first workflow.
order: 1
---

# Java SDK — Getting Started

The [Serverless Workflow Java SDK](https://github.com/serverlessworkflow/sdk-java) lets you
read, write, validate and run workflows defined with the
[Serverless Workflow DSL](https://github.com/serverlessworkflow/specification). The `7.x`
stream targets **Specification 1.0.0**.

## Requirements

- Java 17 or later
- Maven 3.8+ or Gradle 7+

## Modules

The SDK is split into focused modules so you only pull in what you need. This guide uses three:

- **`serverlessworkflow-api`** — the workflow object model (a hierarchy of POJOs generated from
  the specification schema, rooted at `io.serverlessworkflow.api.types.Workflow`) plus the
  `WorkflowReader`/`WorkflowWriter` helpers to read and write definitions as YAML or JSON.
- **`serverlessworkflow-impl-core`** — the reference runtime that executes a definition:
  `WorkflowApplication`, `WorkflowDefinition`, `WorkflowModel` and the task implementations.
- **`serverlessworkflow-impl-jackson`** — the Jackson-based serialization backend the runtime
  uses to convert workflow data to and from the in-memory model.

## Add the dependency

Add the three modules described above to your build. The SDK publishes a **BOM**
(`serverlessworkflow-bom`) that aligns the versions of every module — import it once and you can
drop the `<version>` from each individual dependency, so they can never drift out of sync.

### Maven

Import the BOM in your `dependencyManagement`, then declare the modules without versions:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.serverlessworkflow</groupId>
            <artifactId>serverlessworkflow-bom</artifactId>
            <version>7.22.2.Final</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>io.serverlessworkflow</groupId>
        <artifactId>serverlessworkflow-api</artifactId>
    </dependency>
    <dependency>
        <groupId>io.serverlessworkflow</groupId>
        <artifactId>serverlessworkflow-impl-core</artifactId>
    </dependency>
    <dependency>
        <groupId>io.serverlessworkflow</groupId>
        <artifactId>serverlessworkflow-impl-jackson</artifactId>
    </dependency>
</dependencies>
```

### Gradle

Use the BOM as a platform, then declare the modules without versions:

```groovy
implementation platform('io.serverlessworkflow:serverlessworkflow-bom:7.22.2.Final')
implementation 'io.serverlessworkflow:serverlessworkflow-api'
implementation 'io.serverlessworkflow:serverlessworkflow-impl-core'
implementation 'io.serverlessworkflow:serverlessworkflow-impl-jackson'
```

## Run your first workflow

Create a `simple.yaml` workflow definition on your classpath (e.g. `src/main/resources/simple.yaml`):

```yaml
document:
  dsl: '1.0.0'
  namespace: default
  name: simple
  version: '1.0.0'
do:
  - hello:
      set:
        message: Hello World
```

Then read it, run it and inspect the output:

```java
package io.cncf;

import io.serverlessworkflow.api.WorkflowReader;
import io.serverlessworkflow.api.types.Workflow;
import io.serverlessworkflow.impl.WorkflowApplication;
import io.serverlessworkflow.impl.WorkflowDefinition;
import io.serverlessworkflow.impl.WorkflowModel;

import java.io.IOException;

public class Main {

    public static void main(String ...args) throws IOException {

        Workflow workflow = WorkflowReader.readWorkflowFromClasspath("simple.yaml"); // (1)
        try (WorkflowApplication app = WorkflowApplication.builder().build()) {      // (2)
            WorkflowDefinition def = app.workflowDefinition(workflow);               // (3)
            WorkflowModel output = def.instance().start().join();                    // (4)
            System.out.println("The message is: " + output.asMap().orElseThrow().get("message")); // (5) -> Hello World
        }
    }
}
```

## What just happened?

Running `Main` reads the definition, executes it and prints `The message is: Hello World`. Here is
what each numbered line does:

1. **Read the definition** — `WorkflowReader.readWorkflowFromClasspath` loads `simple.yaml` from the
   classpath and parses it into a `Workflow`, the in-memory object model from the
   `serverlessworkflow-api` module.
2. **Create the application** — `WorkflowApplication` is the runtime entry point that holds the
   shared configuration used to run workflows. It is `AutoCloseable`, so the try-with-resources
   block releases its resources when you are done.
3. **Build a definition** — `app.workflowDefinition(workflow)` turns the parsed model into an
   executable `WorkflowDefinition` you can run as many times as you like.
4. **Run an instance** — `def.instance().start()` starts a new execution and returns a
   `CompletableFuture`; `.join()` waits for it to finish and yields the output as a `WorkflowModel`.
5. **Read the output** — the `hello` task set `message` to `Hello World`, so `output.asMap()`
   exposes that value, which we print.

---

Thanks for reading. Happy coding! 🚀

